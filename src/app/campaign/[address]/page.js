// src/app/campaign/[address]/page.js

import { getCampaignData } from '../../api/data';
import DetailClient from './DetailClient';

// This function tells Next.js which paths to pre-render (optional, but good practice)
// Note: You would typically get the paths from getStaticPaths in the Pages Router,
// but in the App Router, we just define the default Server Component here.

// Server component receives { params } object with the dynamic segment
export default async function CampaignDetailsPage({ params }) {
    
    const awaitedParams=await params;
    const campaignAddress = awaitedParams.address;

    try {
        const { Data, DonationsData } = await getCampaignData(campaignAddress);

        return (
            // Pass fetched data as props to the client component
            <DetailClient Data={Data} DonationsData={DonationsData} />
        );
    } catch (error) {
        console.error(`Failed to load campaign ${campaignAddress}:`, error);
        // Handle loading failure gracefully
        return <div>Error: Failed to load campaign details. Check console.</div>;
    }
}