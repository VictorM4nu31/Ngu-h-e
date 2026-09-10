import ErrorPage from './ErrorPage';

export default function TooManyRequests() {
    return (
        <ErrorPage
            code="429"
            title="Too Many Requests"
            message="You have made too many requests. Please wait a moment and try again."
        />
    );
}
