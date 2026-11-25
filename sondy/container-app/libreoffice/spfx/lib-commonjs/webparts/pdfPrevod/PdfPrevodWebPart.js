"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var sp_core_library_1 = require("@microsoft/sp-core-library");
var sp_webpart_base_1 = require("@microsoft/sp-webpart-base");
var sp_property_pane_1 = require("@microsoft/sp-property-pane");
var sp_http_1 = require("@microsoft/sp-http");
/** Soubor z disku → POST /api/pdf (tělo = binárka, ?ext=) → odkaz na PDF. Token uživatele přes AadHttpClient
 *  (scope access_as_user z webApiPermissionRequests v package-solution.json). */
var PdfPrevodWebPart = /** @class */ (function (_super) {
    tslib_1.__extends(PdfPrevodWebPart, _super);
    function PdfPrevodWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PdfPrevodWebPart.prototype._client = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () { return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, this.context.aadHttpClientFactory.getClient(this.properties.apiAppId)];
        }); });
    };
    PdfPrevodWebPart.prototype._url = function (p) { return "".concat(this.properties.apiUrl.replace(/\/$/, '')).concat(p); };
    PdfPrevodWebPart.prototype.render = function () {
        var _this = this;
        var d = this.domElement;
        if (!this.properties.apiUrl || !this.properties.apiAppId) {
            d.innerHTML = '<p>Vyplň v nastavení web partu apiUrl a apiAppId.</p>';
            return;
        }
        d.innerHTML = "<div style=\"font-family:Segoe UI,sans-serif;max-width:760px\">\n      <h3>P\u0159evod do PDF (LibreOffice v Container App)</h3>\n      <button id=\"me\">Kdo jsem (token)</button>\n      <input id=\"f\" type=\"file\" accept=\".docx,.xlsx,.pptx\"> <button id=\"go\">P\u0159ev\u00E9st do PDF</button>\n      <div id=\"a\" style=\"margin:8px 0\"></div>\n      <pre id=\"o\" style=\"white-space:pre-wrap;background:#f3f2f1;padding:8px;min-height:60px\">\u2026</pre></div>";
        var o = d.querySelector('#o'), a = d.querySelector('#a');
        d.querySelector('#me').onclick = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var t0, r, _a, _b, _c, e_1;
            var _d;
            return tslib_1.__generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        o.textContent = 'volám…';
                        t0 = performance.now();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this._client()];
                    case 2: return [4 /*yield*/, (_e.sent()).get(this._url('/api/me'), sp_http_1.AadHttpClient.configurations.v1)];
                    case 3:
                        r = _e.sent();
                        _a = o;
                        _c = (_b = JSON).stringify;
                        _d = { status: r.status, ms: Math.round(performance.now() - t0) };
                        return [4 /*yield*/, r.json()];
                    case 4:
                        _a.textContent = _c.apply(_b, [(_d.body = _e.sent(), _d), null, 2]);
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _e.sent();
                        o.textContent = 'CHYBA: ' + e_1.message;
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        d.querySelector('#go').onclick = function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var file, t0, ext, r, _a, _b, _c, ms, _d, _e, _f, blob, link, head, _g, e_2;
            var _h, _j;
            var _k;
            return tslib_1.__generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        file = (_k = d.querySelector('#f').files) === null || _k === void 0 ? void 0 : _k[0];
                        if (!file) {
                            o.textContent = 'Vyber soubor.';
                            return [2 /*return*/];
                        }
                        o.textContent = 'převádím…';
                        a.innerHTML = '';
                        t0 = performance.now();
                        _l.label = 1;
                    case 1:
                        _l.trys.push([1, 9, , 10]);
                        ext = (file.name.split('.').pop() || '').toLowerCase();
                        return [4 /*yield*/, this._client()];
                    case 2:
                        _b = (_a = (_l.sent())).post;
                        _c = [this._url("/api/pdf?ext=".concat(encodeURIComponent(ext))), sp_http_1.AadHttpClient.configurations.v1];
                        _h = { headers: { 'Content-Type': 'application/octet-stream' } };
                        return [4 /*yield*/, file.arrayBuffer()];
                    case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([(_h.body = _l.sent(), _h)]))];
                    case 4:
                        r = _l.sent();
                        ms = Math.round(performance.now() - t0);
                        if (!(r.status !== 200)) return [3 /*break*/, 6];
                        _d = o;
                        _f = (_e = JSON).stringify;
                        _j = { status: r.status, ms: ms };
                        return [4 /*yield*/, r.text()];
                    case 5:
                        _d.textContent = _f.apply(_e, [(_j.body = _l.sent(), _j), null, 2]);
                        return [2 /*return*/];
                    case 6: return [4 /*yield*/, r.blob()];
                    case 7:
                        blob = _l.sent();
                        link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = file.name.replace(/\.[^.]+$/, '') + '.pdf';
                        link.id = 'pdf';
                        link.textContent = "St\u00E1hnout ".concat(link.download);
                        a.appendChild(link);
                        _g = Uint8Array.bind;
                        return [4 /*yield*/, blob.slice(0, 5).arrayBuffer()];
                    case 8:
                        head = new (_g.apply(Uint8Array, [void 0, _l.sent()]))();
                        o.textContent = JSON.stringify({ status: r.status, ms: ms, serverConvertMs: r.headers.get('x-convert-ms'), pdfBytes: blob.size,
                            contentType: r.headers.get('content-type'), magic: String.fromCharCode.apply(null, Array.prototype.slice.call(head)) }, null, 2);
                        return [3 /*break*/, 10];
                    case 9:
                        e_2 = _l.sent();
                        o.textContent = 'CHYBA: ' + e_2.message;
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    };
    Object.defineProperty(PdfPrevodWebPart.prototype, "dataVersion", {
        get: function () { return sp_core_library_1.Version.parse('1.0'); },
        enumerable: false,
        configurable: true
    });
    PdfPrevodWebPart.prototype.getPropertyPaneConfiguration = function () {
        return { pages: [{ groups: [{ groupName: 'API', groupFields: [
                                (0, sp_property_pane_1.PropertyPaneTextField)('apiUrl', { label: 'URL Container App (https://…)' }),
                                (0, sp_property_pane_1.PropertyPaneTextField)('apiAppId', { label: 'appId API registrace' })
                            ] }] }] };
    };
    return PdfPrevodWebPart;
}(sp_webpart_base_1.BaseClientSideWebPart));
exports.default = PdfPrevodWebPart;
//# sourceMappingURL=PdfPrevodWebPart.js.map