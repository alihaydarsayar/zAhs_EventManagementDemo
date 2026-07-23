sap.ui.define([
    "com/alihaydarsayar/demo/zfiorieventmng/controller/BaseController",
    "com/alihaydarsayar/demo/zfiorieventmng/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (BaseController, formatter, JSONModel, Filter, FilterOperator, Sorter) {
    "use strict";

    // Sıralamada kullanılan mantıksal durum sırası (en kritik önce)
    var mStatusOrder = {
        EXCEPTION: 0,
        DELAYED: 1,
        IN_TRANSIT: 2,
        PLANNED: 3,
        COMPLETED: 4
    };

    return BaseController.extend("com.alihaydarsayar.demo.zfiorieventmng.controller.Main", {

        formatter: formatter,

        onInit: function () {
            this._sStatusFilter = "ALL";
            this._sModeFilter = "ALL";
            this._sQuery = "";

            this.getView().setModel(new JSONModel({
                count: 0,
                summary: "",
                counts: { ALL: 0, PLANNED: 0, IN_TRANSIT: 0, DELAYED: 0, EXCEPTION: 0, COMPLETED: 0 }
            }), "view");

            this.getOwnerComponent().getModel("em").dataLoaded().then(this._updateCounts.bind(this));
        },

        /**
         * KPI kartına basıldığında listeyi ilgili duruma göre filtreler.
         * @param {sap.ui.base.Event} oEvent Tile press olayı
         */
        onKpiPress: function (oEvent) {
            var oTile = oEvent.getSource();
            this._sStatusFilter = oTile.data("filterKey");

            // Etkin kartı görsel olarak işaretle
            oTile.getParent().getItems().forEach(function (oItem) {
                oItem.removeStyleClass("emKpiTileActive");
            });
            oTile.addStyleClass("emKpiTileActive");

            this._applyFilters();
        },

        /**
         * Arama alanı değiştiğinde listeyi filtreler.
         * @param {sap.ui.base.Event} oEvent Search/liveChange olayı
         */
        onSearch: function (oEvent) {
            var sValue = oEvent.getParameter("newValue");
            if (sValue === undefined || sValue === null) {
                sValue = oEvent.getParameter("query") || "";
            }
            this._sQuery = sValue.trim();
            this._applyFilters();
        },

        /**
         * Taşıma modu seçimi değiştiğinde listeyi filtreler.
         * @param {sap.ui.base.Event} oEvent Select change olayı
         */
        onModeChange: function (oEvent) {
            this._sModeFilter = oEvent.getParameter("selectedItem").getKey();
            this._applyFilters();
        },

        /**
         * Sıralama ölçütü değiştiğinde tabloyu yeniden sıralar.
         * @param {sap.ui.base.Event} oEvent Select change olayı
         */
        onSortChange: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            var oBinding = this.byId("handlerTable").getBinding("items");

            if (sKey === "status") {
                oBinding.sort(new Sorter("status", false, false, function (a, b) {
                    return mStatusOrder[a] - mStatusOrder[b];
                }));
            } else if (sKey === "delayHours") {
                oBinding.sort(new Sorter("delayHours", true));
            } else {
                oBinding.sort(new Sorter(sKey, false));
            }
        },

        /**
         * Satıra tıklandığında detay sayfasına gider.
         * @param {sap.ui.base.Event} oEvent ColumnListItem press olayı
         */
        onItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("em");
            this.getRouter().navTo("RouteDetail", {
                handlerId: oContext.getProperty("id")
            });
        },

        /**
         * Liste her güncellendiğinde başlıktaki kayıt sayısını tazeler.
         * @param {sap.ui.base.Event} oEvent updateFinished olayı
         */
        onUpdateFinished: function (oEvent) {
            this.getModel("view").setProperty("/count", oEvent.getParameter("total"));
        },

        /**
         * Mock veriyi yeniden yükler ve sayaçları tazeler.
         */
        onRefresh: function () {
            this.getOwnerComponent().getModel("em").refresh(true);
            this._updateCounts();
        },

        /**
         * Durum filtresi ile arama metnini birleştirip listeye uygular.
         */
        _applyFilters: function () {
            var aFilters = [];

            if (this._sStatusFilter !== "ALL") {
                aFilters.push(new Filter("status", FilterOperator.EQ, this._sStatusFilter));
            }

            if (this._sModeFilter !== "ALL") {
                aFilters.push(new Filter("freight/mode", FilterOperator.EQ, this._sModeFilter));
            }

            if (this._sQuery) {
                aFilters.push(new Filter({
                    filters: [
                        new Filter("trackingId", FilterOperator.Contains, this._sQuery),
                        new Filter("description", FilterOperator.Contains, this._sQuery),
                        new Filter("partner", FilterOperator.Contains, this._sQuery),
                        new Filter("currentLocation", FilterOperator.Contains, this._sQuery)
                    ],
                    and: false
                }));
            }

            // Sayaç, listenin updateFinished olayında güncellenir
            this.byId("handlerTable").getBinding("items").filter(aFilters);
        },

        /**
         * KPI sayaçlarını ve özet metnini mock veriden hesaplar.
         */
        _updateCounts: function () {
            var aHandlers = this.getOwnerComponent().getModel("em").getProperty("/handlers") || [];
            var oCounts = { ALL: aHandlers.length, PLANNED: 0, IN_TRANSIT: 0, DELAYED: 0, EXCEPTION: 0, COMPLETED: 0 };

            aHandlers.forEach(function (oHandler) {
                oCounts[oHandler.status] = (oCounts[oHandler.status] || 0) + 1;
            });

            var oViewModel = this.getModel("view");
            oViewModel.setProperty("/counts", oCounts);
            oViewModel.setProperty("/summary",
                this.getText("kpiDelayed") + ": " + oCounts.DELAYED +
                "  •  " + this.getText("kpiException") + ": " + oCounts.EXCEPTION +
                "  •  " + this.getText("kpiInTransit") + ": " + oCounts.IN_TRANSIT);

            this._applyFilters();
        }
    });
});
