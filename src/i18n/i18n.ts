import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from '../../../../resources/lang/es.json'

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources: { es: { translation: es } },
        lng: "es",
        interpolation: { escapeValue: false }
    });

export default i18n;