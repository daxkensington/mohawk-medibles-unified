/**
 * Admin Cart Recovery API — Abandoned cart stats and listing
 * GET /api/admin/cart-recovery
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CartRecord = Awaited<ReturnType<typeof prisma.abandonedCart.findMany>>[number];

export async function GET(_req: NextRequest) {
    try {
        const allCarts = await prisma.abandonedCart.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, email: true } },
                recoveryEmails: {
                    select: { id: true, status: true, emailNumber: true, sentAt: true },
                    orderBy: { sentAt: "desc" },
                    take: 1,
                },
            },
        });

        const active = allCarts.filter((c: CartRecord) => c.status === "active").length;
        const recovered = allCarts.filter((c: CartRecord) => c.status === "recovered").length;
        const expired = allCarts.filter((c: CartRecord) => c.status === "expired").length;
        const total = allCarts.length;
        const recoveryRate = total > 0 ? ((recovered / total) * 100).toFixed(1) : "0.0";

        const abandonedValue = allCarts
            .filter((c: CartRecord) => c.status === "active")
            .reduce((sum, c) => sum + (c.cartTotal || 0), 0);

        const recoveredValue = allCarts
            .filter((c: CartRecord) => c.status === "recovered")
            .reduce((sum, c) => sum + (c.cartTotal || 0), 0);

        return NextResponse.json({
            stats: { active, recovered, expired, total, recoveryRate, abandonedValue, recoveredValue },
            carts: allCarts.map((cart) => ({
                id: cart.id,
                email: cart.email || cart.user?.email || `User #${cart.userId}`,
                customerName: cart.user?.name || null,
                cartTotal: cart.cartTotal,
                emailsSent: cart.emailsSent,
                status: cart.status,
                lastEmailStatus: cart.recoveryEmails[0]?.status || null,
                createdAt: cart.createdAt.toISOString(),
                recoveredAt: cart.recoveredAt?.toISOString() || null,
            })),
        });
    } catch (error) {
        console.error("Admin cart-recovery error:", error);
        return NextResponse.json(
            {
                stats: { active: 0, recovered: 0, expired: 0, total: 0, recoveryRate: "0.0", abandonedValue: 0, recoveredValue: 0 },
                carts: [],
            },
            { status: 500 }
        );
    }
}
