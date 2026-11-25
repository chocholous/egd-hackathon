# OCR větších souborů 2026-11-22T19:56:40Z (tools/ai-gateway-probe.sh ocr)
## velky.pdf 9,2 MB, 6 stran
{"error":"Document Intelligence odmítlo dokument","detail":"{\"error\":{\"code\":\"InvalidRequest\",\"message\":\"Invalid request.\",\"innererror\":{\"code\":\"InvalidContentLength\",\"message\":\"The input image is too large. Refer to documentation for the maximum file size.\"}}}"}
[HTTP 502, 3.073106s]

## velky3.pdf 3,1 MB, 2 strany
{"text":"Částka k úhradě: 12 345,00 Kč\nPříliš žluťoučký kůň úpěl ďábelské ódy Dodavatel: Řezníkův závod, s.r.o.\nČástka k úhradě: 12 345,00 Kč\nPříliš žluťoučký kůň úpěl ďábelské ódy Dodavatel: Řezníkův závod, s.r.o.","pages":2,"costUsd":0.003,"ms":2621,"kvotaDnes":{"tokens":2152,"limit":50000}}
[HTTP 200, 2.879789s]

## velky.jpg 1,5 MB
{"text":"Částka k úhradě: 12 345,00 Kč\nPříliš žluťoučký kůň úpěl ďábelské ódy\nDodavatel: Řezníkův závod, s.r.o.","pages":1,"costUsd":0.0015,"ms":1413,"kvotaDnes":{"tokens":2152,"limit":50000}}
[HTTP 200, 1.626611s]

## vision velky.jpg
{"text":"Na obrázku je text:\n\nČástka k úhradě: 12 345,00 Kč\n\nPříliš žluťoučký kůň úpěl ďábelské ódy\n\nDodavatel: Řezníkův závod, s.r.o.","usage":{"completion_tokens":62,"completion_tokens_details":{"accepted_prediction_tokens":0,"audio_tokens":0,"reasoning_tokens":0,"re
[HTTP 200, 5.554878s]

## velky4.pdf 4613226 B, 3 strany
{"error":"Document Intelligence odmítlo dokument","detail":"{\"error\":{\"code\":\"InvalidRequest\",\"message\":\"Invalid request.\",\"innererror\":{\"code\":\"InvalidContentLength\",\"message\":\"The input image is too large. Refer to documentation for the maximum file size.\"}}}"}
[HTTP 502, 1.684943s]
