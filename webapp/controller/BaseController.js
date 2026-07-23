sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("com.alihaydarsayar.demo.zfiorieventmng.controller.BaseController", {

        /**
         * Uygulamanın router örneğini döndürür.
         * @returns {sap.ui.core.routing.Router} Router
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * View üzerindeki modeli döndürür.
         * @param {string} [sName] Model adı
         * @returns {sap.ui.model.Model} Model
         */
        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        /**
         * i18n metnini döndürür.
         * @param {string} sKey Metin anahtarı
         * @param {Array} [aArgs] Yer tutucu değerleri
         * @returns {string} Çevrilmiş metin
         */
        getText: function (sKey, aArgs) {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        }
    });
});
