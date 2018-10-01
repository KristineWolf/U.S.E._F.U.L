# U.S.E_F.U.L

## Das Spiel

### Was soll U.S.E._F.U.L. sein, wenn es fertig ist?
Bei U.S.E. (Abk. für „Unit for Space Exploration“) handelt es sich um ein
RPG in einem Science-Fiction-Setting. Der Spieler übernimmt dabei die
Rolle einer Künstlichen Intelligenz, welche von der Erde in entfernte Teile
der Galaxie ausgesandt wurde, um fremde Welten zu erkunden, neue
Zivilisationen und Lebensformen zu finden und den ersten Kontakt mit
diesen aufzunehmen. Auf dieser Reise strandet U.S.E. jedoch tief im
Feindesgebiet...
U.S.E. soll in Vogelperspektive mit 2D-Grafiken implementiert werden. Der
primäre Zweck ist, wie bei vielen Spielen, Spielspaß und allgemeiner
Zeitvertreib. Der Spieler kann sich frei in alle Richtungen in einer zufällig
generierten Welt, welche einer Galaxie nachempfunden werden soll,
bewegen. Der sichtbare Ausschnitt ist dabei immer nur ein kleiner Teil der
gesamten, verfügbaren Karte. Er trifft dort auf feindliche, aber auch
freundliche Schiffe. Erstere muss er dabei bekämpfen oder vor ihnen
flüchten. Wie bei RPGs üblich wird der Spieler im Laufe des Spiels Level
oder Upgrades erhalten, mit deren Hilfe er es mit immer stärkeren
Gegnern aufnehmen kann. Im Kampf mit diesen Gegnern verliert der
Spieler Lebenspunkte und kann sogar vernichtet werden, wenn er nicht
dafür sorgt, dass er auf geeignete Art und Weise wieder Leben erhält.
Besonderer Spielspaß ist dabei durch die stets anders aussehende Karte
gegeben.


### Aktueller Status

Derzeit befindet sich das Spiel noch in der Entwicklungsphase. Ein Multiplayer- und Score-System wurde entwickelt.
Es werden auch alte Spielstände problemfrei weider aufgenommen.

![Bild laedt...](/docs/Menu.png?raw=1)
![Bild laedt...](/docs/Zoomed%20In%20Game.png?raw=1)
![Bild laedt...](/docs/Zoomed%20Out%20Game.png?raw=1)

### Was noch zu tun ist

Die Implementation von Roleplay-Elementen wäre der nächste größere Schritte bei der Entwicklung des Spiels.

### Wie man es startet

Um das Spiel zu starten, benötigt man prinzipiell zwei Komponenten:
- Einen lokalen Webserver für den Client
- Einen Node-Server für die Multiplayer-Komponente

Zunächst holt man sich die Client-Dateien aus diesem git-repository, und falls man das Spiel lokal hosten möchte, auch den Server.
Im Client befinden sich weiterhin zwei kleine Python-Scripts.
StartOfficial.py konfiguriert das Spiel so, dass es auf den offiziellen Server verbindet, während StartLocal.py auf einen localhost mit dem Port 8000 verbindet, falls man das Spiel lokal hosten möchte.
Danach ist ein lokaler Webserver zu starten. Eine einfache Methode hierfür bietet beispielsweise Python mit folgendem Befehl:
```
python -m SimpleHTTPServer
```
Dann könnt ihr auch schon in euren Webbrowser gehen und mit
```
http://localhost:8000
```
das Spiel starten. Dort ist zunächst eine Anmeldung nötig.
##### Offizieller Server
Ist die Anmeldung erfolgreich, könnt ihr das Spiel eigentlich auch schon genießen!

##### Lokaler Server
Wollt ihr das Spiel lokal hosten - um zu sehen wie was genau funktioniert, oder falls unsere offiziellen Server nicht verfügbar sind -, ist mit 

```
node Server.js
```
im Ordner des Servers einen Node-Server starten. Vergesst nicht mit dem Python-Script den Client auf einen lokalen Server zu konfigurieren!
Eine Anmeldung ist jedoch dennoch notwendig! Auch die erreichte Highscore wird auf die Datenbank hochgeladen.
#### Credits

Das Spiel wurde programmiert von Andreas Hennings, Christoph Härtl, Judith Amrhein und Kristine Wolf.
Die Grafiken für die Schiffe wurden auf [Millionth Vector](http://millionthvector.blogspot.de/) gefunden.
