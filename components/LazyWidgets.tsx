"use client";

import dynamic from "next/dynamic";

const AgentChatWidget = dynamic(() => import("@/components/AgentChatWidget"), { ssr: false });
const AgeGate = dynamic(() => import("@/components/AgeGate"), { ssr: false });
const ConsentBanner = dynamic(() => import("@/components/ConsentBanner"), { ssr: false });

export default function LazyWidgets() {
    return (
        <>
            <AgentChatWidget />
            <AgeGate />
            <ConsentBanner />
        </>
    );
}
