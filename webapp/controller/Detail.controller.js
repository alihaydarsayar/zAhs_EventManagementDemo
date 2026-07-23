sap.ui.define([
    "com/alihaydarsayar/demo/zfiorieventmng/controller/BaseController",
    "com/alihaydarsayar/demo/zfiorieventmng/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, formatter, JSONModel, Fragment, History, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("com.alihaydarsayar.demo.zfiorieventmng.controller.Detail", {

        formatter: formatter,

        onInit: function () {
            this.getView().setModel(new JSONModel({
                code: "",
                at: null,
                location: "",
                note: ""
            }), "newEvent");

            this.getRouter().getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        /**
         * URL'deki takip numarasına karşılık gelen kaydı view'a bağlar.
         * @param {sap.ui.base.Event} oEvent Route eşleşme olayı
         */
        _onObjectMatched: function (oEvent) {
            var sHandlerId = decodeURIComponent(oEvent.getParameter("arguments").handlerId);
            var oModel = this.getOwnerComponent().getModel("em");

            oModel.dataLoaded().then(function () {
                var aHandlers = oModel.getProperty("/handlers") || [];
                var iIndex = aHandlers.findIndex(function (oHandler) {
                    return oHandler.id === sHandlerId;
                });

                if (iIndex < 0) {
                    MessageBox.error(this.getText("handlerNotFound"), {
                        onClose: this.onNavBack.bind(this)
                    });
                    return;
                }

                this._sHandlerPath = "/handlers/" + iIndex;
                this.getView().bindElement({ path: this._sHandlerPath, model: "em" });
            }.bind(this));
        },

        /**
         * Listeye geri döner.
         */
        onNavBack: function () {
            var oHistory = History.getInstance();
            if (oHistory.getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("RouteMain", {}, true);
            }
        },

        /**
         * Olay bildirme diyaloğunu açar ve alanları ön doldurur.
         */
        onOpenReportDialog: function () {
            var oHandler = this.getView().getBindingContext("em").getObject();

            this.getModel("newEvent").setData({
                code: "",
                at: new Date(),
                location: oHandler.currentLocation,
                note: ""
            });

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: this.getView().getId(),
                    name: "com.alihaydarsayar.demo.zfiorieventmng.view.fragment.ReportEvent",
                    controller: this
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }

            this._pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        /**
         * Diyaloğu kaydetmeden kapatır.
         */
        onCancelReport: function () {
            this._pDialog.then(function (oDialog) {
                oDialog.close();
            });
        },

        /**
         * Bildirilen olayı zaman çizelgesine ekler ve başlık verilerini günceller.
         */
        onSubmitReport: function () {
            var oNew = this.getModel("newEvent").getData();

            if (!oNew.code || !oNew.at || !oNew.location) {
                MessageToast.show(this.getText("validationRequired"));
                return;
            }

            var oModel = this.getOwnerComponent().getModel("em");
            var oHandler = oModel.getProperty(this._sHandlerPath);
            var aCodes = oModel.getProperty("/eventCodes");
            var sAt = this._toIsoLocal(oNew.at);

            // Aynı olay kodu beklenen olarak duruyorsa onu gerçekleşene çevir, yoksa yeni satır ekle
            var oExpected = oHandler.events.find(function (oEvent) {
                return oEvent.code === oNew.code && oEvent.state !== "ACTUAL";
            });

            // Zaman çizelgesindeki mevcut ad korunur, yoksa katalogdan alınır
            var sName = oExpected ? oExpected.name
                : ((aCodes.find(function (o) { return o.code === oNew.code; }) || {}).name || oNew.code);

            if (oExpected) {
                oExpected.state = oNew.code === "EXC" ? "EXCEPTION" : "ACTUAL";
                oExpected.at = sAt;
                oExpected.location = oNew.location;
                oExpected.note = oNew.note;
                oExpected.reportedBy = "Fiori Kullanıcısı";
            } else {
                oHandler.events.push({
                    code: oNew.code,
                    name: sName,
                    at: sAt,
                    location: oNew.location,
                    state: oNew.code === "EXC" ? "EXCEPTION" : "ACTUAL",
                    reportedBy: "Fiori Kullanıcısı",
                    note: oNew.note
                });
            }

            this._recalculateHandler(oHandler, sName, sAt, oNew);
            oModel.setProperty(this._sHandlerPath, oHandler);
            oModel.refresh(true);

            this._pDialog.then(function (oDialog) {
                oDialog.close();
            });
            MessageToast.show(this.getText("eventReported", [sName]));
        },

        /**
         * Bildirilen olaya göre başlık alanlarını (durum, ilerleme, konum) yeniden hesaplar.
         * @param {object} oHandler Takip nesnesi
         * @param {string} sName Olay adı
         * @param {string} sAt ISO zaman damgası
         * @param {object} oNew Diyalogdaki girdi
         */
        _recalculateHandler: function (oHandler, sName, sAt, oNew) {
            oHandler.lastEvent = sName;
            oHandler.lastEventAt = sAt;
            oHandler.currentLocation = oNew.location;

            var iTotal = oHandler.events.length;
            var iDone = oHandler.events.filter(function (oEvent) {
                return oEvent.state === "ACTUAL";
            }).length;
            oHandler.progress = Math.round(iDone / iTotal * 100);

            if (oNew.code === "EXC") {
                oHandler.status = "EXCEPTION";
                oHandler.exceptions.push({
                    text: oNew.note || sName,
                    severity: "Error",
                    at: sAt
                });
            } else if (oNew.code === "POD") {
                oHandler.status = "COMPLETED";
                oHandler.actualEnd = sAt;
                oHandler.progress = 100;
            } else if (oHandler.status !== "DELAYED") {
                oHandler.status = "IN_TRANSIT";
            }
        },

        /**
         * Date nesnesini saat dilimi kaydırması olmadan ISO metnine çevirir.
         * @param {Date} oDate Tarih
         * @returns {string} ISO benzeri yerel zaman damgası
         */
        _toIsoLocal: function (oDate) {
            var fnPad = function (iValue) {
                return String(iValue).padStart(2, "0");
            };
            return oDate.getFullYear() + "-" + fnPad(oDate.getMonth() + 1) + "-" + fnPad(oDate.getDate()) +
                "T" + fnPad(oDate.getHours()) + ":" + fnPad(oDate.getMinutes()) + ":00";
        }
    });
});
