import React, { createContext, useContext, useState, useEffect } from 'react';
import { Therapist, SubscriptionTier } from '../types';
import { apiRequest } from '../api/client';

interface AuthContextType {
  therapist: Therapist | null;
  activeRole: 'therapist' | 'client_portal' | 'public_profile';
  setActiveRole: (role: 'therapist' | 'client_portal' | 'public_profile') => void;
  activeClientSlug: string;
  setActiveClientSlug: (slug: string) => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  switchTherapist: (therapistId: string) => Promise<void>;
  upgradeTier: (newTier: SubscriptionTier) => Promise<void>;
  refreshTherapist: () => Promise<void>;
  isLoading: boolean;
  notificationBadgeCount: number;
  triggerUpgradeModal: (reason?: string) => void;
  upgradeModalOpen: boolean;
  upgradeModalReason: string;
  closeUpgradeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [activeRole, setActiveRole] = useState<'therapist' | 'client_portal' | 'public_profile'>('therapist');
  const [activeClientSlug, setActiveClientSlug] = useState<string>('dr-sharma');
  const [selectedClientId, setSelectedClientId] = useState<string>('client_priya_patel');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationBadgeCount] = useState<number>(2);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeModalReason, setUpgradeModalReason] = useState<string>('');

  const fetchTherapist = async (id: string = 'therapist_ananya_sharma') => {
    try {
      setIsLoading(true);
      const data = await apiRequest<Therapist>(`/therapist/profile/${id}`);
      setTherapist(data);
      setActiveClientSlug(data.slug);
    } catch (err) {
      console.error('Failed to load therapist profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapist();
  }, []);

  const switchTherapist = async (therapistId: string) => {
    await fetchTherapist(therapistId);
  };

  const upgradeTier = async (newTier: SubscriptionTier) => {
    if (!therapist) return;
    try {
      const res = await apiRequest<{ success: boolean; therapist: Therapist }>(`/therapist/tier/upgrade`, {
        method: 'POST',
        body: JSON.stringify({ therapistId: therapist.id, targetTier: newTier })
      });
      if (res.therapist) {
        setTherapist(res.therapist);
      }
    } catch (err) {
      console.error('Failed to upgrade tier', err);
    }
  };

  const refreshTherapist = async () => {
    if (therapist) {
      await fetchTherapist(therapist.id);
    }
  };

  const triggerUpgradeModal = (reason?: string) => {
    setUpgradeModalReason(reason || 'This feature is available on the Professional tier.');
    setUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setUpgradeModalOpen(false);
    setUpgradeModalReason('');
  };

  return (
    <AuthContext.Provider
      value={{
        therapist,
        activeRole,
        setActiveRole,
        activeClientSlug,
        setActiveClientSlug,
        selectedClientId,
        setSelectedClientId,
        switchTherapist,
        upgradeTier,
        refreshTherapist,
        isLoading,
        notificationBadgeCount,
        triggerUpgradeModal,
        upgradeModalOpen,
        upgradeModalReason,
        closeUpgradeModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
