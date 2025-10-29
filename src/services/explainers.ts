/**
 * Service layer for mechanism explainers
 * Handles CRUD operations for MechanismExplainer entities
 */

import { db } from './db';
import type { MechanismExplainer } from '@/types/mechanism';

/**
 * Create a new mechanism explainer
 */
export const createExplainer = async (
  explainer: MechanismExplainer
): Promise<string> => {
  try {
    const id = await db.explainers.add(explainer);
    return id;
  } catch (error) {
    console.error('Failed to create explainer:', error);
    throw new Error('Failed to create explainer');
  }
};

/**
 * Get explainer by ID
 */
export const getExplainerById = async (
  id: string
): Promise<MechanismExplainer | undefined> => {
  try {
    return await db.explainers.get(id);
  } catch (error) {
    console.error('Failed to get explainer:', error);
    throw new Error('Failed to get explainer');
  }
};

/**
 * Get explainer by mechanism name
 * Returns the first matching explainer (case-insensitive)
 */
export const getExplainerByMechanism = async (
  mechanism: string
): Promise<MechanismExplainer | undefined> => {
  try {
    const allExplainers = await db.explainers.toArray();
    return allExplainers.find(
      (e) => e.mechanism.toLowerCase() === mechanism.toLowerCase()
    );
  } catch (error) {
    console.error('Failed to get explainer by mechanism:', error);
    throw new Error('Failed to get explainer by mechanism');
  }
};

/**
 * Get all explainers
 */
export const getAllExplainers = async (): Promise<MechanismExplainer[]> => {
  try {
    return await db.explainers.toArray();
  } catch (error) {
    console.error('Failed to get explainers:', error);
    throw new Error('Failed to get explainers');
  }
};

/**
 * Update an existing explainer
 */
export const updateExplainer = async (
  id: string,
  updates: Partial<MechanismExplainer>
): Promise<void> => {
  try {
    await db.explainers.update(id, {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update explainer:', error);
    throw new Error('Failed to update explainer');
  }
};

/**
 * Delete an explainer
 */
export const deleteExplainer = async (id: string): Promise<void> => {
  try {
    await db.explainers.delete(id);
  } catch (error) {
    console.error('Failed to delete explainer:', error);
    throw new Error('Failed to delete explainer');
  }
};

/**
 * Check if an explainer exists for a mechanism
 */
export const explainerExists = async (mechanism: string): Promise<boolean> => {
  try {
    const explainer = await getExplainerByMechanism(mechanism);
    return !!explainer;
  } catch (error) {
    return false;
  }
};

