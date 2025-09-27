/**
 * OPPORTUNITY SERVICE - RealEstateCRM Pro
 * Manages opportunities auto-created from client qualifications
 * Handles pipeline progression and deal tracking
 */

import { BaseService } from './baseService';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  createOpportunityFromQualification,
  validateOpportunityData,
  calculateProbability,
  calculateCommission,
  calculatePriority,
  OPPORTUNITY_STATUS,
  OPPORTUNITY_STAGES
} from '../models/opportunityModel';

class OpportunityService extends BaseService {
  constructor() {
    super('opportunities');
  }

  /**
   * Create opportunity from client qualification
   * Called automatically when qualification is added
   */
  async createFromQualification(consultantId, client, qualification) {
    try {
      // Generate opportunity data from qualification
      const opportunityData = createOpportunityFromQualification(client, qualification);
      
      // Add system fields
      const completeData = {
        ...opportunityData,
        consultantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdFrom: 'qualification',
        isActive: true
      };

      // Validate opportunity data
      const validation = validateOpportunityData(completeData);
      if (!validation.valid) {
        throw new Error(`Invalid opportunity data: ${validation.errors.join(', ')}`);
      }

      // Create opportunity document
      const docRef = await addDoc(
        this.getCollectionRef(consultantId),
        completeData
      );

      // Log activity
      await this.addActivity(consultantId, docRef.id, {
        type: 'created',
        description: `Opportunity created from ${qualification.type} qualification`,
        automatic: true
      });

      return {
        id: docRef.id,
        ...completeData
      };
    } catch (error) {
      console.error('Error in createFromQualification:', error);
      throw error;
    }
  }

  /**
   * Create opportunity manually
   */
  async createOpportunity(consultantId, opportunityData) {
    try {
      // Add system fields
      const completeData = {
        ...opportunityData,
        consultantId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdFrom: 'manual',
        isActive: true,
        metadata: {
          ...opportunityData.metadata,
          daysInPipeline: 0,
          stageHistory: [
            {
              stage: opportunityData.stage || OPPORTUNITY_STAGES.QUALIFICATION,
              enteredAt: new Date(),
              duration: 0
            }
          ]
        }
      };

      // Validate opportunity data
      const validation = validateOpportunityData(completeData);
      if (!validation.valid) {
        throw new Error(`Invalid opportunity data: ${validation.errors.join(', ')}`);
      }

      // Calculate initial probability if not set
      if (!completeData.probability) {
        completeData.probability = calculateProbability(completeData);
      }

      // Create opportunity document
      const docRef = await addDoc(
        this.getCollectionRef(consultantId),
        completeData
      );

      // Log activity
      await this.addActivity(consultantId, docRef.id, {
        type: 'created',
        description: 'Opportunity created manually'
      });

      return {
        id: docRef.id,
        ...completeData
      };
    } catch (error) {
      console.error('Error in createOpportunity:', error);
      throw error;
    }
  }

  /**
   * Update opportunity
   */
  async updateOpportunity(consultantId, opportunityId, updates) {
    try {
      // Remove system fields from updates
      const { id, consultantId: _, createdAt, ...validUpdates } = updates;

      // Add update timestamp
      validUpdates.updatedAt = serverTimestamp();

      // If stage is changing, update stage history
      if (validUpdates.stage) {
        const current = await this.getById(consultantId, opportunityId);
        if (current.stage !== validUpdates.stage) {
          validUpdates.metadata = {
            ...current.metadata,
            stageHistory: await this.updateStageHistory(
              current.metadata.stageHistory,
              current.stage,
              validUpdates.stage
            )
          };

          // Log stage change
          await this.addActivity(consultantId, opportunityId, {
            type: 'stage_changed',
            description: `Stage changed from ${current.stage} to ${validUpdates.stage}`,
            oldValue: current.stage,
            newValue: validUpdates.stage
          });
        }
      }

      // Recalculate probability if relevant data changed
      if (validUpdates.stage || validUpdates.buyerData || validUpdates.sellerData) {
        const current = await this.getById(consultantId, opportunityId);
        const updated = { ...current, ...validUpdates };
        validUpdates.probability = calculateProbability(updated);
      }

      // Update document
      await updateDoc(
        doc(this.getCollectionRef(consultantId), opportunityId),
        validUpdates
      );

      return { id: opportunityId, ...validUpdates };
    } catch (error) {
      console.error('Error in updateOpportunity:', error);
      throw error;
    }
  }

  /**
   * Update stage history
   */
  async updateStageHistory(history, oldStage, newStage) {
    const now = new Date();
    const updatedHistory = [...history];

    // Update duration of current stage
    const currentStageEntry = updatedHistory.find(h => h.stage === oldStage);
    if (currentStageEntry) {
      const enteredAt = new Date(currentStageEntry.enteredAt);
      currentStageEntry.duration = Math.floor((now - enteredAt) / (1000 * 60 * 60 * 24)); // Days
    }

    // Add new stage entry
    updatedHistory.push({
      stage: newStage,
      enteredAt: now,
      duration: 0
    });

    return updatedHistory;
  }

  /**
   * Move opportunity through pipeline stages
   */
  async moveToStage(consultantId, opportunityId, newStage) {
    try {
      const opportunity = await this.getById(consultantId, opportunityId);
      
      // Validate stage progression
      const stageOrder = [
        OPPORTUNITY_STAGES.QUALIFICATION,
        OPPORTUNITY_STAGES.PROSPECTING,
        OPPORTUNITY_STAGES.VIEWING,
        OPPORTUNITY_STAGES.NEGOTIATION,
        OPPORTUNITY_STAGES.DOCUMENTATION,
        OPPORTUNITY_STAGES.CLOSING,
        OPPORTUNITY_STAGES.COMPLETED
      ];

      const currentIndex = stageOrder.indexOf(opportunity.stage);
      const newIndex = stageOrder.indexOf(newStage);

      // Allow moving forward or backward
      if (newIndex === -1) {
        throw new Error('Invalid stage');
      }

      // Update stage
      await this.updateOpportunity(consultantId, opportunityId, {
        stage: newStage,
        status: newStage === OPPORTUNITY_STAGES.COMPLETED 
          ? OPPORTUNITY_STATUS.COMPLETED 
          : opportunity.status
      });

      // If moving to completed, update close date
      if (newStage === OPPORTUNITY_STAGES.COMPLETED) {
        await this.completeOpportunity(consultantId, opportunityId);
      }

      return true;
    } catch (error) {
      console.error('Error in moveToStage:', error);
      throw error;
    }
  }

  /**
   * Complete an opportunity
   */
  async completeOpportunity(consultantId, opportunityId) {
    try {
      await this.updateOpportunity(consultantId, opportunityId, {
        status: OPPORTUNITY_STATUS.COMPLETED,
        stage: OPPORTUNITY_STAGES.COMPLETED,
        closedAt: serverTimestamp(),
        probability: 100,
        'metadata.completedAt': serverTimestamp()
      });

      // Log completion
      await this.addActivity(consultantId, opportunityId, {
        type: 'completed',
        description: 'Opportunity completed successfully'
      });

      return true;
    } catch (error) {
      console.error('Error in completeOpportunity:', error);
      throw error;
    }
  }

  /**
   * Cancel an opportunity
   */
  async cancelOpportunity(consultantId, opportunityId, reason = null) {
    try {
      await this.updateOpportunity(consultantId, opportunityId, {
        status: OPPORTUNITY_STATUS.CANCELLED,
        cancelledAt: serverTimestamp(),
        cancellationReason: reason,
        probability: 0
      });

      // Log cancellation
      await this.addActivity(consultantId, opportunityId, {
        type: 'cancelled',
        description: `Opportunity cancelled${reason ? `: ${reason}` : ''}`
      });

      return true;
    } catch (error) {
      console.error('Error in cancelOpportunity:', error);
      throw error;
    }
  }

  /**
   * Pause an opportunity
   */
  async pauseOpportunity(consultantId, opportunityId, reason = null) {
    try {
      await this.updateOpportunity(consultantId, opportunityId, {
        status: OPPORTUNITY_STATUS.PAUSED,
        pausedAt: serverTimestamp(),
        pauseReason: reason
      });

      // Log pause
      await this.addActivity(consultantId, opportunityId, {
        type: 'paused',
        description: `Opportunity paused${reason ? `: ${reason}` : ''}`
      });

      return true;
    } catch (error) {
      console.error('Error in pauseOpportunity:', error);
      throw error;
    }
  }

  /**
   * Reactivate a paused opportunity
   */
  async reactivateOpportunity(consultantId, opportunityId) {
    try {
      await this.updateOpportunity(consultantId, opportunityId, {
        status: OPPORTUNITY_STATUS.ACTIVE,
        reactivatedAt: serverTimestamp(),
        pausedAt: null,
        pauseReason: null
      });

      // Log reactivation
      await this.addActivity(consultantId, opportunityId, {
        type: 'reactivated',
        description: 'Opportunity reactivated'
      });

      return true;
    } catch (error) {
      console.error('Error in reactivateOpportunity:', error);
      throw error;
    }
  }

  /**
   * Get opportunity by ID
   */
  async getById(consultantId, opportunityId) {
    try {
      const docSnap = await getDoc(
        doc(this.getCollectionRef(consultantId), opportunityId)
      );

      if (!docSnap.exists()) {
        throw new Error('Opportunity not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  /**
   * List opportunities with filters and pagination
   */
  async listOpportunities(consultantId, options = {}) {
    try {
      const {
        filterBy = {},
        sortBy = 'createdAt',
        sortOrder = 'desc',
        pageSize = 20,
        lastDoc = null
      } = options;

      let q = query(
        this.getCollectionRef(consultantId),
        orderBy(sortBy, sortOrder),
        limit(pageSize)
      );

      // Apply filters
      if (filterBy.status) {
        q = query(q, where('status', '==', filterBy.status));
      }

      if (filterBy.stage) {
        q = query(q, where('stage', '==', filterBy.stage));
      }

      if (filterBy.type) {
        q = query(q, where('type', '==', filterBy.type));
      }

      if (filterBy.clientId) {
        q = query(q, where('clientId', '==', filterBy.clientId));
      }

      if (filterBy.priority) {
        q = query(q, where('priority', '==', filterBy.priority));
      }

      if (filterBy.minValue) {
        q = query(q, where('value', '>=', filterBy.minValue));
      }

      if (filterBy.maxValue) {
        q = query(q, where('value', '<=', filterBy.maxValue));
      }

      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const opportunities = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        opportunities.push({
          id: doc.id,
          ...doc.data()
        });
        lastVisible = doc;
      });

      return {
        opportunities,
        lastDoc: lastVisible,
        hasMore: opportunities.length === pageSize
      };
    } catch (error) {
      console.error('Error in listOpportunities:', error);
      throw error;
    }
  }

  /**
   * Get opportunities by client
   */
  async getByClient(consultantId, clientId) {
    try {
      const q = query(
        this.getCollectionRef(consultantId),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const opportunities = [];

      snapshot.forEach((doc) => {
        opportunities.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return opportunities;
    } catch (error) {
      console.error('Error in getByClient:', error);
      throw error;
    }
  }

  /**
   * Get pipeline view (opportunities grouped by stage)
   */
  async getPipelineView(consultantId, filters = {}) {
    try {
      let q = query(
        this.getCollectionRef(consultantId),
        where('status', '==', OPPORTUNITY_STATUS.ACTIVE)
      );

      // Apply additional filters
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      const snapshot = await getDocs(q);
      const pipeline = {
        qualification: [],
        prospecting: [],
        viewing: [],
        negotiation: [],
        documentation: [],
        closing: []
      };

      snapshot.forEach((doc) => {
        const opportunity = { id: doc.id, ...doc.data() };
        const stage = opportunity.stage;
        
        if (pipeline[stage]) {
          pipeline[stage].push(opportunity);
        }
      });

      // Calculate totals for each stage
      const totals = {};
      Object.keys(pipeline).forEach(stage => {
        totals[stage] = {
          count: pipeline[stage].length,
          value: pipeline[stage].reduce((sum, opp) => sum + (opp.value || 0), 0),
          weightedValue: pipeline[stage].reduce((sum, opp) => 
            sum + ((opp.value || 0) * (opp.probability || 0) / 100), 0
          )
        };
      });

      return {
        pipeline,
        totals,
        stages: Object.keys(pipeline)
      };
    } catch (error) {
      console.error('Error in getPipelineView:', error);
      throw error;
    }
  }

  /**
   * Add activity to opportunity
   */
  async addActivity(consultantId, opportunityId, activity) {
    try {
      const activityData = {
        ...activity,
        timestamp: serverTimestamp(),
        performedBy: consultantId
      };

      await updateDoc(
        doc(this.getCollectionRef(consultantId), opportunityId),
        {
          activities: arrayUnion(activityData),
          'metadata.lastInteraction': serverTimestamp(),
          'metadata.totalInteractions': increment(1)
        }
      );

      return activityData;
    } catch (error) {
      console.error('Error in addActivity:', error);
      throw error;
    }
  }

  /**
   * Add note to opportunity
   */
  async addNote(consultantId, opportunityId, noteText) {
    try {
      const note = {
        text: noteText,
        createdAt: serverTimestamp(),
        createdBy: consultantId
      };

      await updateDoc(
        doc(this.getCollectionRef(consultantId), opportunityId),
        {
          notes: arrayUnion(note),
          updatedAt: serverTimestamp()
        }
      );

      return note;
    } catch (error) {
      console.error('Error in addNote:', error);
      throw error;
    }
  }

  /**
   * Schedule viewing for opportunity
   */
  async scheduleViewing(consultantId, opportunityId, viewingData) {
    try {
      const viewing = {
        id: `view_${Date.now()}`,
        ...viewingData,
        scheduledAt: serverTimestamp(),
        status: 'scheduled'
      };

      await updateDoc(
        doc(this.getCollectionRef(consultantId), opportunityId),
        {
          viewings: arrayUnion(viewing),
          updatedAt: serverTimestamp()
        }
      );

      // Log activity
      await this.addActivity(consultantId, opportunityId, {
        type: 'viewing_scheduled',
        description: `Viewing scheduled for ${viewingData.date}`,
        viewingId: viewing.id
      });

      return viewing;
    } catch (error) {
      console.error('Error in scheduleViewing:', error);
      throw error;
    }
  }

  /**
   * Add proposal to opportunity
   */
  async addProposal(consultantId, opportunityId, proposalData) {
    try {
      const proposal = {
        id: `prop_${Date.now()}`,
        ...proposalData,
        createdAt: serverTimestamp(),
        status: 'pending'
      };

      await updateDoc(
        doc(this.getCollectionRef(consultantId), opportunityId),
        {
          proposals: arrayUnion(proposal),
          updatedAt: serverTimestamp()
        }
      );

      // Log activity
      await this.addActivity(consultantId, opportunityId, {
        type: 'proposal_added',
        description: `Proposal added: €${proposalData.amount}`,
        proposalId: proposal.id
      });

      // If in viewing stage, move to negotiation
      const opportunity = await this.getById(consultantId, opportunityId);
      if (opportunity.stage === OPPORTUNITY_STAGES.VIEWING) {
        await this.moveToStage(consultantId, opportunityId, OPPORTUNITY_STAGES.NEGOTIATION);
      }

      return proposal;
    } catch (error) {
      console.error('Error in addProposal:', error);
      throw error;
    }
  }

  /**
   * Link deal to opportunity
   */
  async linkDeal(consultantId, opportunityId, dealId) {
    try {
      await updateDoc(
        doc(this.getCollectionRef(consultantId), opportunityId),
        {
          deals: arrayUnion(dealId),
          updatedAt: serverTimestamp()
        }
      );

      // Log activity
      await this.addActivity(consultantId, opportunityId, {
        type: 'deal_linked',
        description: 'Deal linked to opportunity',
        dealId
      });

      return true;
    } catch (error) {
      console.error('Error in linkDeal:', error);
      throw error;
    }
  }

  /**
   * Calculate opportunity metrics
   */
  async getMetrics(consultantId, period = 'month') {
    try {
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const snapshot = await getDocs(this.getCollectionRef(consultantId));
      
      const metrics = {
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        totalValue: 0,
        completedValue: 0,
        weightedPipeline: 0,
        averageDaysToClose: 0,
        conversionRate: 0,
        byType: {},
        byStage: {},
        newInPeriod: 0,
        completedInPeriod: 0,
        expectedCommission: 0
      };

      let totalDaysToClose = 0;
      let closedCount = 0;

      snapshot.forEach((doc) => {
        const opp = doc.data();
        
        metrics.total++;
        
        // Status counts
        if (opp.status === OPPORTUNITY_STATUS.ACTIVE) {
          metrics.active++;
          metrics.weightedPipeline += (opp.value || 0) * (opp.probability || 0) / 100;
          metrics.expectedCommission += calculateCommission(opp) * (opp.probability || 0) / 100;
        }
        if (opp.status === OPPORTUNITY_STATUS.COMPLETED) {
          metrics.completed++;
          metrics.completedValue += opp.value || 0;
          metrics.expectedCommission += calculateCommission(opp);
          
          // Calculate days to close
          if (opp.createdAt && opp.closedAt) {
            const created = new Date(opp.createdAt.seconds * 1000);
            const closed = new Date(opp.closedAt.seconds * 1000);
            const days = Math.floor((closed - created) / (1000 * 60 * 60 * 24));
            totalDaysToClose += days;
            closedCount++;
          }
        }
        if (opp.status === OPPORTUNITY_STATUS.CANCELLED) {
          metrics.cancelled++;
        }

        // Total value
        metrics.totalValue += opp.value || 0;

        // By type
        if (opp.type) {
          metrics.byType[opp.type] = (metrics.byType[opp.type] || 0) + 1;
        }

        // By stage
        if (opp.stage) {
          metrics.byStage[opp.stage] = (metrics.byStage[opp.stage] || 0) + 1;
        }

        // Check if in period
        if (opp.createdAt) {
          const createdDate = new Date(opp.createdAt.seconds * 1000);
          if (createdDate >= startDate) {
            metrics.newInPeriod++;
          }
        }

        if (opp.closedAt) {
          const closedDate = new Date(opp.closedAt.seconds * 1000);
          if (closedDate >= startDate) {
            metrics.completedInPeriod++;
          }
        }
      });

      // Calculate averages
      if (closedCount > 0) {
        metrics.averageDaysToClose = Math.round(totalDaysToClose / closedCount);
      }

      // Calculate conversion rate
      if (metrics.total > 0) {
        metrics.conversionRate = Math.round((metrics.completed / metrics.total) * 100);
      }

      return metrics;
    } catch (error) {
      console.error('Error in getMetrics:', error);
      throw error;
    }
  }

  /**
   * Get opportunities needing attention
   */
  async getOpportunitiesNeedingAttention(consultantId) {
    try {
      const opportunities = [];
      const now = new Date();

      // Get active opportunities
      const q = query(
        this.getCollectionRef(consultantId),
        where('status', '==', OPPORTUNITY_STATUS.ACTIVE)
      );

      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const opp = { id: doc.id, ...doc.data() };
        const reasons = [];

        // No activity in 7 days
        if (opp.metadata?.lastInteraction) {
          const lastInteraction = new Date(opp.metadata.lastInteraction.seconds * 1000);
          const daysSinceInteraction = Math.floor((now - lastInteraction) / (1000 * 60 * 60 * 24));
          if (daysSinceInteraction > 7) {
            reasons.push(`No activity for ${daysSinceInteraction} days`);
          }
        } else {
          reasons.push('No recorded activity');
        }

        // Stuck in same stage for too long
        if (opp.metadata?.stageHistory) {
          const currentStage = opp.metadata.stageHistory[opp.metadata.stageHistory.length - 1];
          if (currentStage && currentStage.enteredAt) {
            const enteredAt = new Date(currentStage.enteredAt);
            const daysInStage = Math.floor((now - enteredAt) / (1000 * 60 * 60 * 24));
            
            const maxDaysPerStage = {
              qualification: 7,
              prospecting: 14,
              viewing: 14,
              negotiation: 7,
              documentation: 14,
              closing: 7
            };

            const maxDays = maxDaysPerStage[opp.stage] || 14;
            if (daysInStage > maxDays) {
              reasons.push(`In ${opp.stage} stage for ${daysInStage} days`);
            }
          }
        }

        // Past expected close date
        if (opp.expectedCloseDate) {
          const expectedClose = new Date(opp.expectedCloseDate);
          if (expectedClose < now && opp.status !== OPPORTUNITY_STATUS.COMPLETED) {
            reasons.push('Past expected close date');
          }
        }

        // Low probability but high value
        if (opp.value > 200000 && opp.probability < 30) {
          reasons.push('High value but low probability');
        }

        if (reasons.length > 0) {
          opportunities.push({
            ...opp,
            attentionReasons: reasons,
            priority: calculatePriority(opp)
          });
        }
      });

      // Sort by priority
      opportunities.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      return opportunities;
    } catch (error) {
      console.error('Error in getOpportunitiesNeedingAttention:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const opportunityService = new OpportunityService();