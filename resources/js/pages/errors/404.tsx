import ErrorPage from './ErrorPage';

export default function NotFound() {
    return (
        <ErrorPage
            code="404"
            title="Not Found"
            message="The page you are looking for could not be found."
        />
    );
}
