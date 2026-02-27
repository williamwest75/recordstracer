import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const TIERS = {
  solo: {
    name: "Solo",
    price_id: "price_1T4XnBCbx7NULXBjQvvjF4R2",
    product_id: "prod_U2d3is0eGOUuHf",
    price: 49,
  },
  investigator: {
    name: "Investigator",
    price_id: "price_1T4XnWCbx7NULXBj2YLH2Kl7",
    product_id: "prod_U2d3BpuPBjhDp3",
    price: 99,
  },
  newsroom: {
    name: "Newsroom",
    price_id: "price_1T4XnkCbx7NULXBjmwcjDW88",
    product_id: "prod_U2d3nRVKMjE8tx",
    price: 299,
  },
} as const;

export type TierKey = keyof typeof TIERS;

export const getTierByProductId = (productId: string): TierKey | null => {
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return null;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  subscribed: boolean;
  subscriptionTier: TierKey | null;
  subscriptionEnd: string | null;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  subscribed: false,
  subscriptionTier: null,
  subscriptionEnd: null,
  subscriptionLoading: true,
  refreshSubscription: async () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<TierKey | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        setSubscriptionLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setSubscribed(data.subscribed ?? false);
      setSubscriptionTier(data.product_id ? getTierByProductId(data.product_id) : null);
      setSubscriptionEnd(data.subscription_end ?? null);
    } catch (err) {
      console.error("Error checking subscription:", err);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
        if (session) {
          setTimeout(() => checkSubscription(), 0);
        } else {
          setSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
          setSubscriptionLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) checkSubscription();
      else setSubscriptionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
        subscribed,
        subscriptionTier,
        subscriptionEnd,
        subscriptionLoading,
        refreshSubscription: checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
