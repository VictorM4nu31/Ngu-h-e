import ErrorPage from './ErrorPage';

export default function Unauthorized() {
    return (
        <ErrorPage
            code="401"
            title="Unauthorized"
            message="Please log in to continue."
        />
    );
}
