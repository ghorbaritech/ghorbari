"use client"
import ProfileSettings from '@/components/dashboard/ProfileSettings';

export default function DesignerSettingsPage() {
    return (
        <ProfileSettings
            table="designers"
            title="Designer Profile"
            description="Showcase your portfolio, experience, and design philosophy."
        />
    );
}
