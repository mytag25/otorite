
import { useEffect } from 'react';

const useTitle = (title) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} | Otorite`;
        } else {
            document.title = 'Otorite | Otomobil Karar Destek Sistemi';
        }
    }, [title]);
};

export default useTitle;
