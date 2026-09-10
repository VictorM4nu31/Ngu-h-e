import ErrorPage from './ErrorPage';

export default function PageExpired() {
    return (
        <ErrorPage
            code="419"
            title="Page Expired"
            message="Your session has expired. Please refresh and try again."
        />
    );
}
