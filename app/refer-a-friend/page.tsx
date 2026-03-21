import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CopyReferralCode } from "@/components/CopyReferralCode";
import { Users, UserPlus, Gift, ArrowRight, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Refer a Friend",
  description: "Earn rewards by referring friends to Mohawk Medibles.",
  alternates: {
    canonical: "https://mohawkmedibles.ca/refer-a-friend",
  },
};

async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("mm-session")?.value;
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload) return null;
  return { userId: payload.sub, email: payload.email };
}

export default async function ReferAFriendPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const userReferrals = await prisma.referral.findMany({
    where: { referrerId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const totalReferred = await prisma.referral.count({
    where: { referrerId: session.userId },
  });

  const referralCode =
    userReferrals[0]?.referralCode ||
    `REF-${session.userId.slice(0, 8).toUpperCase()}`;

  const completedReferrals = userReferrals.filter(
    (r) => r.status === "completed"
  );
  const totalPointsEarned = completedReferrals.reduce(
    (sum, r) => sum + r.referrerPointsAwarded,
    0
  );

  const steps = [
    {
      icon: Share2,
      title: "Share Your Code",
      desc: "Give your referral code to friends",
    },
    {
      icon: UserPlus,
      title: "Friend Signs Up",
      desc: "They create an account using your code",
    },
    {
      icon: Gift,
      title: "Both Earn Rewards",
      desc: "You both get bonus loyalty points after their first order",
    },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-blue-900/20 to-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            Referral Program
          </div>
          <h1 className="text-5xl font-heading font-black text-white mb-3">
            Refer a Friend
          </h1>
          <p className="text-muted-foreground text-lg">
            Share the love and earn rewards together
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-blue-600/10 via-primary/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-8 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Your Referral Code
          </p>
          <p className="text-4xl font-heading font-black text-primary mb-4 tracking-wider">
            {referralCode}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Share this code with friends and both of you earn rewards!
          </p>
          <CopyReferralCode code={referralCode} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-xl p-5 text-center hover:border-blue-500/30 transition-colors">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{totalReferred}</p>
            <p className="text-xs text-muted-foreground">Friends Referred</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center hover:border-green-500/30 transition-colors">
            <UserPlus className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">
              {completedReferrals.length}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center hover:border-primary/30 transition-colors">
            <Gift className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-primary">
              {totalPointsEarned}
            </p>
            <p className="text-xs text-muted-foreground">Points Earned</p>
          </div>
        </div>

        {/* How it works */}
        <h2 className="text-xl font-heading font-bold text-white mb-6 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {steps.map((item, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 text-center relative hover:border-blue-500/30 transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-blue-400" />
              </div>
              <p className="font-bold text-white mb-1">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              {i < 2 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 text-border" />
              )}
            </div>
          ))}
        </div>

        {/* Referral History */}
        {userReferrals.length > 0 && (
          <>
            <h2 className="text-xl font-heading font-bold text-white mb-4">
              Referral History
            </h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="p-4 font-medium text-muted-foreground">
                      Code
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Points Earned
                    </th>
                    <th className="p-4 font-medium text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userReferrals.map((ref) => (
                    <tr
                      key={ref.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="p-4 font-bold text-white font-mono">
                        {ref.referralCode}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            ref.status === "completed"
                              ? "bg-green-600/20 text-green-400"
                              : ref.status === "signed_up"
                                ? "bg-blue-600/20 text-blue-400"
                                : "bg-amber-600/20 text-amber-400"
                          }`}
                        >
                          {ref.status === "completed"
                            ? "Completed"
                            : ref.status === "signed_up"
                              ? "Signed Up"
                              : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-primary font-bold">
                        +{ref.referrerPointsAwarded}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {ref.createdAt
                          ? new Date(ref.createdAt).toLocaleDateString(
                              "en-CA",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
