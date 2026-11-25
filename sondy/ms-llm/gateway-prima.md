# Přímá volání gateway 2026-11-22T18:59:13Z, X-App-Id demo, tools/ai-gateway-probe.sh
## chat 1
{"text":"Na chodbě ve 2. patře nesvítí tři zářivky, je tam tma, prosím o jejich výměnu.","usage":{"completion_tokens":34,"completion_tokens_details":{"accepted_prediction_tokens":0,"audio_tokens":0,"reasoning_tokens":0,"rejected_prediction_tokens":0},"latency_checkpoint":{"engine_tbt_ms":5,"engine_ttft_ms":22,"engine_ttlt_ms":197,"pre_inference_ms":76,"service_tbt_ms":7,"service_ttft_ms":388,"service_ttlt_ms":641,"user_visible_ttft_ms":311},"prompt_tokens":50,"prompt_tokens_details":{"audio_tokens":0,"cached_tokens":0},"total_tokens":84},"costUsd":0.0000744,"model":"gpt-4.1-mini-2025-04-14","ms":1607,"kvotaDnes":{"tokens":1496,"limit":50000}}
[HTTP 200, 1.772817s]
## chat 2
{"text":"Na chodbě ve 2. patře nesvítí tři zářivky, prosím o jejich výměnu.","usage":{"completion_tokens":29,"completion_tokens_details":{"accepted_prediction_tokens":0,"audio_tokens":0,"reasoning_tokens":0,"rejected_prediction_tokens":0},"latency_checkpoint":{"engine_tbt_ms":6,"engine_ttft_ms":28,"engine_ttlt_ms":198,"pre_inference_ms":86,"service_tbt_ms":6,"service_ttft_ms":400,"service_ttlt_ms":565,"user_visible_ttft_ms":314},"prompt_tokens":50,"prompt_tokens_details":{"audio_tokens":0,"cached_tokens":0},"total_tokens":79},"costUsd":0.0000664,"model":"gpt-4.1-mini-2025-04-14","ms":905,"kvotaDnes":{"tokens":1575,"limit":50000}}
[HTTP 200, 1.068169s]
## vision
{"text":"Na obrázku je text, který vypadá jako část nějakého dokumentu nebo účtenky. Přepsaný text je:\n\nČástka k úhradě: 12 345,00 Kč\n\nPříliš žluťoučký kůň úpěl ďábelské ódy\n\nDodavatel: Řezníkův závod, s.r.o.","usage":{"completion_tokens":84,"completion_tokens_details":{"accepted_prediction_tokens":0,"audio_tokens":0,"reasoning_tokens":0,"rejected_prediction_tokens":0},"latency_checkpoint":{"engine_tbt_ms":7,"engine_ttft_ms":308,"engine_ttlt_ms":922,"pre_inference_ms":97,"service_tbt_ms":7,"service_ttft_ms":1680,"service_ttlt_ms":2288,"user_visible_ttft
[HTTP 200, 2.848818s]
## ocr prebuilt-read
{"text":"Částka k úhradě: 12 345,00 Kč Příliš žluťoučký kůň úpěl ďábelské ódy Dodavatel: Řezníkův závod, s.r.o.","pages":1,"costUsd":0.0015,"ms":987,"kvotaDnes":{"tokens":2152,"limit":50000}}
[HTTP 200, 1.269595s]
## ocr prebuilt-invoice
{"text":"FAKTURA c. 2026-0142\nDodavatel: Test s.r.o., ICO 12345678\nOdberatel: EG.D, a.s.\nDatum splatnosti: 15. 12. 2026\nCelkem k uhrade: 12 345,00 CZK","pages":1,"costUsd":0.01,"fields":{"CustomerName":{"type":"string","valueString":"EG.D, a.s.","content":"EG.D, a.s.","boundingRegions":[{"pageNumber":1,"polygon":[168,177,286,180,285,207,167,204]}],"confidence":0.995,"spans":[{"offset":69,"length":10}]},"DueDate":{"type":"date","valueDate":"2026-12-15","content":"15. 12. 2026","boundingRegions":[{"pageNumber":1,"polygon":[247,229,387,227,387,253,247,255]}],"confidence":0.995,"spans":[{"offset":98,"length":12}]},"InvoiceId":{"type":"string","valueString":"2026-0142","content":"2026-0142","boundingRegions":[{"pageNumber":1,"polygon":[246,53,410,53,410,83,246,83]}],"confidence":0.995,"spans":[{"offset":11,"length":9}]},"InvoiceTotal":{"type":"currency","valueCurrency":{"currencySymbol":"
[HTTP 200, 1.968859s]
## image
{"error":"Generování obrázků není nasazeno (kvóta modelu gpt-image je v subscription 0, vyžaduje žádost o přístup)."}
[HTTP 501, 0.332001s]
## kvota
{"den":"2026-11-22","appKey":"demo","spotreba":{"tokens":2152,"calls":20,"costUsd":0.019442,"pages":6},"limitTokenuZaDen":50000}
[HTTP 200, 0.381933s]
