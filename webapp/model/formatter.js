sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat"
], function (DateFormat, NumberFormat) {
    "use strict";

    var oDateTimeFormat = DateFormat.getDateTimeInstance({ style: "medium" });
    var oDateFormat = DateFormat.getDateInstance({ style: "medium" });
    var oCurrencyFormat = NumberFormat.getCurrencyInstance({ showMeasure: true });

    return {

        /**
         * ISO tarihini okunabilir tarih/saat metnine çevirir.
         * @param {string} sValue ISO 8601 tarih
         * @returns {string} Biçimlendirilmiş metin, boşsa "-"
         */
        dateTime: function (sValue) {
            if (!sValue) {
                return "-";
            }
            return oDateTimeFormat.format(new Date(sValue));
        },

        /**
         * ISO tarihini yalnızca gün olarak biçimlendirir.
         * @param {string} sValue ISO 8601 tarih
         * @returns {string} Biçimlendirilmiş metin, boşsa "-"
         */
        date: function (sValue) {
            if (!sValue) {
                return "-";
            }
            return oDateFormat.format(new Date(sValue));
        },

        /**
         * Durum kodunu çevrilmiş metne dönüştürür.
         * @param {string} sStatus Durum kodu
         * @returns {string} Çevrilmiş durum metni
         */
        statusText: function (sStatus) {
            var oBundle = this.getModel("i18n").getResourceBundle();
            return oBundle.getText("status" + sStatus);
        },

        /**
         * Durum kodunu sap.ui.core.ValueState değerine eşler.
         * @param {string} sStatus Durum kodu
         * @returns {string} ValueState
         */
        statusState: function (sStatus) {
            switch (sStatus) {
                case "COMPLETED": return "Success";
                case "DELAYED": return "Warning";
                case "EXCEPTION": return "Error";
                case "IN_TRANSIT": return "Information";
                default: return "None";
            }
        },

        /**
         * Durum kodu için ikon döndürür.
         * @param {string} sStatus Durum kodu
         * @returns {string} sap-icon URI
         */
        statusIcon: function (sStatus) {
            switch (sStatus) {
                case "COMPLETED": return "sap-icon://sys-enter-2";
                case "DELAYED": return "sap-icon://alert";
                case "EXCEPTION": return "sap-icon://error";
                case "IN_TRANSIT": return "sap-icon://shipping-status";
                default: return "sap-icon://pending";
            }
        },

        /**
         * Gecikme saatini metne çevirir.
         * @param {number} iHours Gecikme (saat)
         * @returns {string} Okunabilir gecikme metni
         */
        delayText: function (iHours) {
            var oBundle = this.getModel("i18n").getResourceBundle();
            if (!iHours) {
                return oBundle.getText("noDelay");
            }
            return oBundle.getText("delayHours", [iHours]);
        },

        /**
         * Gecikme varsa uyarı durumu döndürür.
         * @param {number} iHours Gecikme (saat)
         * @returns {string} ValueState
         */
        delayState: function (iHours) {
            if (!iHours) {
                return "Success";
            }
            return iHours > 24 ? "Error" : "Warning";
        },

        /**
         * Gerçekleşen varış zamanını, henüz yoksa bilgi metnini döndürür.
         * @param {string} sValue ISO 8601 tarih
         * @returns {string} Okunabilir metin
         */
        actualEndText: function (sValue) {
            if (!sValue) {
                return this.getModel("i18n").getResourceBundle().getText("notYet");
            }
            return oDateTimeFormat.format(new Date(sValue));
        },

        /**
         * Gerçekleşen varış için durum rengi.
         * @param {string} sValue ISO 8601 tarih
         * @returns {string} ValueState
         */
        actualEndState: function (sValue) {
            return sValue ? "Success" : "None";
        },

        /**
         * "Bildiren: X" metnini oluşturur.
         * @param {string} sPattern i18n deseni
         * @param {string} sReporter Bildiren kaynak
         * @returns {string} Birleştirilmiş metin
         */
        reportedByText: function (sPattern, sReporter) {
            if (!sReporter) {
                return "";
            }
            return sPattern.replace("{0}", sReporter);
        },

        /**
         * Olay durumuna göre ikon rengi (sap.ui.core.IconColor).
         * @param {string} sState Olay durumu
         * @returns {string} IconColor
         */
        eventIconColor: function (sState) {
            switch (sState) {
                case "ACTUAL": return "Positive";
                case "OVERDUE": return "Critical";
                case "EXCEPTION": return "Negative";
                default: return "Neutral";
            }
        },

        /**
         * Olay durumuna göre ikon döndürür.
         * @param {string} sState Olay durumu
         * @returns {string} sap-icon URI
         */
        eventIcon: function (sState) {
            switch (sState) {
                case "ACTUAL": return "sap-icon://accept";
                case "OVERDUE": return "sap-icon://alert";
                case "EXCEPTION": return "sap-icon://error";
                default: return "sap-icon://pending";
            }
        },

        /**
         * Olay durumunu çevrilmiş metne dönüştürür.
         * @param {string} sState Olay durumu
         * @returns {string} Çevrilmiş metin
         */
        eventStateText: function (sState) {
            var oBundle = this.getModel("i18n").getResourceBundle();
            return oBundle.getText("eventState" + sState);
        },

        /**
         * Olay durumunu ObjectStatus state değerine eşler.
         * @param {string} sState Olay durumu
         * @returns {string} ValueState
         */
        eventStateValue: function (sState) {
            switch (sState) {
                case "ACTUAL": return "Success";
                case "OVERDUE": return "Warning";
                case "EXCEPTION": return "Error";
                default: return "None";
            }
        },

        /**
         * Tutarı para birimiyle biçimlendirir.
         * @param {number} fAmount Tutar
         * @param {string} sCurrency Para birimi kodu
         * @returns {string} Biçimlendirilmiş tutar
         */
        currency: function (fAmount, sCurrency) {
            if (fAmount === undefined || fAmount === null || !sCurrency) {
                return "";
            }
            return oCurrencyFormat.format(fAmount, sCurrency);
        },

        /**
         * Rota durağının durumuna göre ikon döndürür.
         * @param {string} sStatus Durak durumu
         * @returns {string} sap-icon URI
         */
        stopIcon: function (sStatus) {
            switch (sStatus) {
                case "DONE": return "sap-icon://sys-enter-2";
                case "DELAYED": return "sap-icon://alert";
                case "EXCEPTION": return "sap-icon://error";
                case "NEXT": return "sap-icon://journey-arrive";
                default: return "sap-icon://pending";
            }
        },

        /**
         * Rota durağının durumunu ValueState'e eşler.
         * @param {string} sStatus Durak durumu
         * @returns {string} ValueState
         */
        stopState: function (sStatus) {
            switch (sStatus) {
                case "DONE": return "Success";
                case "DELAYED": return "Warning";
                case "EXCEPTION": return "Error";
                case "NEXT": return "Information";
                default: return "None";
            }
        },

        /**
         * Rota durağının durumunu çevrilmiş metne dönüştürür.
         * @param {string} sStatus Durak durumu
         * @returns {string} Çevrilmiş metin
         */
        stopStateText: function (sStatus) {
            return this.getModel("i18n").getResourceBundle().getText("stop" + sStatus);
        },

        /**
         * İlerleme yüzdesine göre çubuk rengini belirler.
         * @param {string} sStatus Durum kodu
         * @returns {string} ValueState
         */
        progressState: function (sStatus) {
            switch (sStatus) {
                case "COMPLETED": return "Success";
                case "DELAYED": return "Warning";
                case "EXCEPTION": return "Error";
                default: return "Information";
            }
        }
    };
});
