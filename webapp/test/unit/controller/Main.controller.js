/*global QUnit*/

sap.ui.define([
	"com/alihaydarsayar/demo/zfiorieventmng/model/formatter"
], function (formatter) {
	"use strict";

	QUnit.module("Formatter");

	QUnit.test("Durum kodları doğru ValueState değerine eşleniyor", function (assert) {
		assert.strictEqual(formatter.statusState("COMPLETED"), "Success");
		assert.strictEqual(formatter.statusState("DELAYED"), "Warning");
		assert.strictEqual(formatter.statusState("EXCEPTION"), "Error");
		assert.strictEqual(formatter.statusState("IN_TRANSIT"), "Information");
		assert.strictEqual(formatter.statusState("PLANNED"), "None");
	});

	QUnit.test("Gecikme durumu saat eşiğine göre belirleniyor", function (assert) {
		assert.strictEqual(formatter.delayState(0), "Success");
		assert.strictEqual(formatter.delayState(12), "Warning");
		assert.strictEqual(formatter.delayState(48), "Error");
	});

	QUnit.test("Olay durumu ikon rengine eşleniyor", function (assert) {
		assert.strictEqual(formatter.eventIconColor("ACTUAL"), "Positive");
		assert.strictEqual(formatter.eventIconColor("OVERDUE"), "Critical");
		assert.strictEqual(formatter.eventIconColor("EXCEPTION"), "Negative");
		assert.strictEqual(formatter.eventIconColor("EXPECTED"), "Neutral");
	});

	QUnit.test("Boş tarih tire olarak gösteriliyor", function (assert) {
		assert.strictEqual(formatter.dateTime(""), "-");
		assert.strictEqual(formatter.date(null), "-");
	});

	QUnit.test("Bildiren metni yer tutucuyu dolduruyor", function (assert) {
		assert.strictEqual(formatter.reportedByText("Bildiren: {0}", "MES"), "Bildiren: MES");
		assert.strictEqual(formatter.reportedByText("Bildiren: {0}", ""), "");
	});

});
