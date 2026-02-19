"use client"
import ProfileSettings from '@/components/dashboard/ProfileSettings';

export default function ServiceProviderSettingsPage() {
    return (
        <ProfileSettings
            table="service_providers"
            title="Provider Profile"
            description="Update your service expertise, experience, and bio."
        />
    );
}
