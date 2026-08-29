import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    const { className, alt, src, ...rest } = props;

    return (
        <img
            {...rest}
            src={src ?? '/logo.png'}
            alt={alt ?? ''}
            loading="lazy"
            className={['aspect-square rounded object-contain', className]
                .filter(Boolean)
                .join(' ')}
        />
    );
}
