# API Trenitalia-ViaggiaTreno
## Introduzione
Work in progress...

 API (non ufficiali) in python del sito viaggiatreno.it. 
Queste api utilizzano dati pubblici forniti dal server web http://www.viaggiatreno.it/infomobilita/, il solo scopo di queste api è fornire supporto ai programmatori di python per la realizzazione di applicazioni inerenti alla mobilità ferroviaria italiana, non ci assumme responsabilità per applicazioni di terzi riguardanti l'utilizzo improprio del codice e dei dati pubblici.

## Funzionamento
 Queste API non eseguono scraping nelle varie pagine del sito; tali infatti effettuano richieste dati al server di viaggiatreno.it attraverso il metodo GET del protocollo HTTP, il server interrogato correttamente restituisce dati JSON e/o text-plain.
Lo studio del funzionamento del server è stato realizzato grazie al codice pubblico JS, JQuery e AJAX che il sito originale presenta.

Le API in python sono tuttora in uno stato primordiale: vengono restituiti solamente dati sottoforma di dizionari (dict) o json.

## Utilizzo
La classe principale delle api è *apitr*, la dichiarazione del costruttore prevede un metodo per il quale, impostato a true i dati *Json* vengono automaticamente convertiti in *dict*.

### Elenco dei Metodi
- ```getInfoMob()```
Ottiene le informazioni aggiornate sulla mobilità ferroviaria

- ```getPartenze(idStazione, dataora)```
Passando il _codice della stazione_ e il datetime della data e ora attuale, ottiene le informazioni sui treni in partenza dalla stazione specificata

- ```getArrivi(idStazione, dataora)```
Passando il _codice della stazione_ e il datetime della data e ora attuale, ottiene le informazioni sui treni in arrivo alla stazione specificata

- ```getAndamento(idStazioneOrigine, idStazioneArrivo, dataoraPartenza)```
Passando sia il _codice della stazione_ di origine sia quello di arrivo  e datetime della data e ora di partenza del treno, ottiene le informazioni sulla percorrenza

- ```getIndicazioniViaggio(idStazioneOrigine, idStazioneArrivo, dataoraAttuale)```
Ottiene le tratte possibili per pianificare un viaggio data una stazione di origine e una di arrivo

- ```searchStazione(nomeStazione)```
Ottiene i dati delle stazioni i quali nomi iniziano con il testo passato

- ```getCodStazione(nomeStazione)```
Restituisce il codice totale della stazione avente come nome completo il testo passato

Esempio di utilizzo delle API in python:
```python
from apitr import apitr

a = apitr(decodeJson= True)

#ottenimento dei treni in arrivo alla stazione S01700
arr = a.getArrivi('S01700', datetime.now())

#ottenimento dei dati di un treno in arrivo alla stazione sopracitata
print(a.getAndamento(arr[10]['codOrigine'], 
	str(arr[10]['numeroTreno']), 
	a.timestamp2datetime(arr[10]['dataPartenzaTreno']))))
```