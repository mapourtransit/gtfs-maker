## Introduzione ##

GtfsMaker è uno script per generare automaticamente i GTFS per il trasporto pubblico di Matera partendo dalle informazioni contenute su OpenStreetMap e gli orari degli autobus dell'azienda di trasporti [Miccolis](http://www.miccolis-spa.it/).

[GTFS](https://developers.google.com/transit/gtfs/) è uno standard de facto che descrive gli orari e le informazioni geografiche associate al trasporto pubblico. Questi dati sono in un formato facilmente interpretabile da un computer e quindi possono essere usati per sviluppare molte applicazioni di interesse per la comunità.

Esempi di applicativi open source dove possono essere caricati i dati GTFS:
* [Travic](http://tracker.geops.ch/). Questo progetto al momento mette a disposizione più di 70 feed gtfs a livello mondiale. [Stiamo lavorando](https://twitter.com/elfpavlik/status/535374589506113536) per far pubblicare i gtfs di Matera sul sito. Solo [tre città italiane](http://tracker.geops.ch/?z=5&s=1&x=1986578.1865&y=4898392.5741&l=transport) sono presenti ora e soltanto Roma per il centro-sud Italia.
* [Liberario](https://github.com/grote/Liberario), un'app Android open source.

La finalità di questo progetto è costruire uno strumento di semplice utilizzo per tenere aggiornate le informazioni sul trasporto pubblico di Matera. Poiché Miccolis gestisce il trasporto pubblico in [molte città](http://www.miccolis-spa.it/la-tua-citta) del sud Italia, speriamo che questo lavoro possa tornare utile anche altrove. Se abitate in una di queste città e siete interessati, siamo disposti a collaborare molto volentieri!

La qualità e la ricchezza di informazioni e dettagli del dataset può essere migliorata con il tempo grazie ai contributi della comunità di mapper OpenStreetMap di Matera.

Al momento solo il file miccolis/timetables/by_line.txt (grazie Alberto!) è generato a mano. Gli altri dati siamo riusciti a ricavarli automaticamente da OpenStreetMap e dagli orari di Miccolis. Il parser per estrarre i dati da Miccolis si trova [qui](https://github.com/unmonastery/miccolis-parser).

I dati su OpenStreetMap sono stati caricati da diversi volenterosi che si sono offerti di passare qualche ora a bordo degli autobus di Matera armati di uno smartphone e tanta pazienza! Abbiamo [una pagina wiki](http://wiki.openstreetmap.org/wiki/Matera) su OSM in cui teniamo traccia dei progressi nella mappatura.

La qualità del dataset è da valutare sul campo: c'è ancora molto lavoro da fare per avere un dataset pulito e senza errori. Alcune informazioni sono mancanti su OpenStreetMap e alcune informazioni informali descritte negli orari di Miccolis non sono state tradotte in GTFS.
In ogni caso lo script riporta anche quali sono i dati mancanti e gli eventuali problemi. Queste informazioni potrebbero essere di aiuto per i mapper al fine di capire dove è necessario intervenire.

Il dataset prodotto da questo script si trova a [questo link](https://github.com/unmonastery/matera-gtfs). Però è sempre meglio eseguire lo script ogni volta perché in questo modo vengono integrate informazioni fresche da OpenStreetMap.

## Installazione ##

Lo script richiede come prerequisito NodeJS e git.

    $ git clone https://github.com/unmonastery/GtfsMaker.git
    $ cd GtfsMaker/
    $ npm install

## Istruzioni ##

Per generare una nuova versione di file GTFS prendendo dati aggiornati da OpenStreetMap:

    $ grunt compile

Il risultato del comando è visibile nella directory gtfs.

Se alcune informazioni sono mancanti su OSM, lo script lo segnala. In questo modo possiamo aiutare la comunità di OpenStreetMap a capire dove è necessario intervenire. Ad esempio,

    stop 2509490275 does not have tags.ref in route 3797255 (Linea 6/B)

Significa che la fermata OSM con id 2509490275 non ha il tag tags.ref (i.e. il  numero di palo nella convenzione che abbiamo seguito). Inoltre indica il numero della relazione di tipo route di cui fa parte la fermata.

Per validare i gtfs prodotti utilizziamo il validatore [FeedValidator](https://github.com/google/transitfeed/wiki/FeedValidator) che può essere eseguito con questo comando:

    $ grunt validate

Viene generato un file validation-results.html che mostra i problemi attuali del gtfs generato.

Poiché il validatore è molto severo e alcune applicazioni potrebbero non accettare i gtfs se non passano il test del validatore, abbiamo scritto un piccolo script per "pulire" i dati gtfs ed eliminare le parti mancanti o che potrebbero causare problemi.

    $ grunt cleaning

Le correzioni che lo script fa vengono mostrate in output.

Infine alcune applicazioni non sanno interpretare i gtfs che usano il file frequencies.txt che elenca le frequenze di arrivo degli autobus senza indicare l'orario esatto. Per questa ragione abbiamo creato un altro script per generare la versione estesa di frequencies.txt con tutti gli orari.

    $ grunt unfolded_stop_times

Il risultato è un file unfolded_stop_times.txt che deve essere rinominato in stop_times.txt quando utilizzato nell'applicazione di interesse.

### Funzionalità avanzate ###

Dai file gtfs è possibile generare un file [RDF](http://www.w3.org/RDF/) grazie al programma [gtfs-csv2rdf](https://github.com/OpenTransport/gtfs-csv2rdf) di @pietercolpaert.

**questo comando funziona solo in Linux per il momento**

    $ grunt compress:gtfs
    $ grunt mkRdf

## Demo ##

Questa è una [demo](http://87.230.17.190:7777/map) che mostra i nostri gtfs al lavoro con [Ulm LiveMap](https://github.com/UlmApi/livemap).
I file gtfs sono usati per simulare la visualizzazione in real time del trasporto pubblico.
Se il server non dovesse essere disponibile, abbiamo preparato anche un [video](http://vimeo.com/112420472)

Stiamo lavorando ad [unTransit](https://github.com/unmonastery/untransit), un'app html/mobile per visualizzare le informazioni contenute nei gtfs in modo più comprensibile per un essere umano. A breve abbiamo intenzione di aggiungere ad unTransit la possibilità di tracciare in tempo reale la propria posizione.

## Risorse utili ##

* [Miccolis Parser](https://github.com/unmonastery/miccolis-parser) lo script che utilizziamo per estrarre informazioni dai file di Miccolis
* [Il formato GTFS](https://developers.google.com/transit/gtfs/)
* [OpenStreetMap Wiki per Matera](http://wiki.openstreetmap.org/wiki/Matera)
* [L'azienda di trasporto pubblico Miccolis](http://www.miccolis-spa.it)
* [Orari Miccolis](https://docs.google.com/spreadsheets/d/1A328lZSG3Y9uSz8uSy2FNkstqgOhokbtgcCVSIB4a5o/edit#gid=234488140)
* [FeedValidator](https://github.com/google/transitfeed/wiki/FeedValidator) by Google

## Licenza ##

* Codice: aGPL,
* GTFS: CC-BY 4.0,
* le informazioni sugli orari degli autobus sono state estrapolate da file che Miccolis mette a disposizione pubblicamente.

## Ringraziamenti ##

* [Piersoft](http://www.piersoft.it/)
* [Simone Cortesi](http://cortesi.com/)
* [nonMonastero](matera.unmonastery.org)
* Demo VM courtesy of @almereyda
