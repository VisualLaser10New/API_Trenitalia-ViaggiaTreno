# API Trenitalia-ViaggiaTreno
## Introduzione
Work in progress...

 Api (non ufficiali) in python del sito viaggiatreno.it. 
Queste api utilizzano dati pubblici forniti dal server web http://www.viaggiatreno.it/infomobilita/, il solo scopo di queste api è fornire supporto ai programmatori di python per la realizzazione di applicazioni inerenti alla mobilità ferroviaria italiana, non ci assumme responsabilità per applicazioni di terzi riguardanti l'utilizzo improprio del codice e dei dati pubblici.

## Funzionamento
 Queste API non eseguono scraping nelle varie pagine del sito; tali infatti effettuano richieste dati al server di viaggiatreno.it attraverso il metodo GET del protocollo HTTP, il server interrogato correttamente restituisce dati JSON e/o text-plain.
Lo studio del funzionamento del server è stato realizzato grazie al codice pubblico JS, JQuery e AJAX che il sito originale presenta.

Le API in python sono tuttora in uno stato primordiale: vengono restituiti solamente dati sottoforma di dizionari (dict).

