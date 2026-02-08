import ServiceRequestForm from '@/components/forms/ServiceRequestForm'

export default function BookServicePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        Start Your Construction Journey
                    </h1>
                    <p className="text-lg text-gray-600">
                        Tell us about your project and we'll match you with the best professionals.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <ServiceRequestForm />
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>Need help? Contact our support team or visit our FAQ.</p>
                </div>
            </div>
        </div>
    )
}
