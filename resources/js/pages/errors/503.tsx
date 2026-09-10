import ErrorPage from './ErrorPage';

export default function ServiceUnavailable() {
    return (
        <ErrorPage
            code="503"
            title="Service Unavailable"
            message="The service is temporarily unavailable. Please try again in a moment."
        />
    );
}
