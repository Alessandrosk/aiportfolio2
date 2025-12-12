
import { SavedPortfolio } from "../types";

const STORAGE_KEY = 'gemini_portfolio_architect_data';

export const getPortfolios = async (): Promise<SavedPortfolio[]> => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
};

export const savePortfolio = async (portfolio: SavedPortfolio): Promise<string> => {
  const portfolios = await getPortfolios();
  // Generate a simple ID
  const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const newPortfolio = { ...portfolio, id: newId };
  
  const updated = [newPortfolio, ...portfolios];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newId;
};

export const deletePortfolio = async (id: string): Promise<void> => {
  const portfolios = await getPortfolios();
  const updated = portfolios.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
