## Introduzione ##

__this introduction is still very much in progress__

GtfsMaker è uno script per generare automaticamente i GTFS per il trasporto pubblico di Matera partendo dalle informazioni contenute su OpenStreetMap e gli orari degli autobus dell'azienda di trasporti [Miccolis](http://www.miccolis-spa.it/).

[GTFS](https://developers.google.com/transit/gtfs/) è uno standard de facto che descrive gli orari e le informazioni geografiche associate al trasporto pubblico. Questi dati sono in un formato facilmente interpretabile da un computer e quindi possono essere usati per sviluppare molte applicazioni di interesse per la comunità.

La finalità di questo progetto è costruire uno strumento di semplice utilizzo per tenere aggiornate le informazioni sul trasporto pubblico di Matera.

La qualità e la ricchezza di informazioni e dettagli del dataset può essere migliorata con il tempo grazie ai contributi della comunità di mapper OpenStreetMap di Matera.

Al momento solo il file miccolis/timetables/by_line.txt è generato a mano. Gli altri dati siamo riusciti a ricavarli automaticamente da OpenStreetMap e dagli orari di Miccolis.

I dati su OpenStreetMap sono stati caricati da diversi volenterosi che si sono offerti di passare qualche ora a bordo degli autobus di Matera armati di uno smartphone e tanta pazienza!

La qualità del dataset è da valutare sul campo. Alcune informazioni sono mancanti su OpenStreetMap, ma lo script riporta anche quali sono i dati mancanti.

## Installazione ##

Lo script richiede come prerequisito NodeJS.

    $ git clone https://github.com/unmonastery/GtfsMaker.git
    $ cd GtfsMaker/
    $ npm install

## Istruzioni ##

La struttura delle directory è la seguente:

- cache - directory temporanea con i file scaricati da OSM
- gtfs  - directory con i file gtfs prodotti dallo script
- miccolis
-- calendar - variazioni stagionali delle corse
-- timetables - orari degli autobus per linea

Per generare una nuova versione di file GTFS prendendo dati aggiornati da OpenStreetMap:

    $ grunt compile

Il risultato del comando è visibile nella directory gtfs.

## Demo ##

TODO

## Risorse utili ##

[Orari Miccolis](https://docs.google.com/spreadsheets/d/1A328lZSG3Y9uSz8uSy2FNkstqgOhokbtgcCVSIB4a5o/edit#gid=234488140)

## Licenza ##

* Codice: aGPL,
* GTFS: CC-BY 4.0,
* le informazioni sugli orari degli autobus sono state estrapolate da file che Miccolis mette a disposizione pubblicamente.

## Ringraziamenti ##

TODO
