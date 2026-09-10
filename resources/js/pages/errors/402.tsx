import ErrorPage from './ErrorPage';

export default function PaymentRequired() {
    return (
        <ErrorPage
            code="402"
            title="Payment Required"
            message="Payment is required to access this page."
        />
    );
}
