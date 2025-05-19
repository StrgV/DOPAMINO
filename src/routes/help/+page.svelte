<script lang="ts">
  import { onMount } from 'svelte';
  import { Loader } from '@googlemaps/js-api-loader';
  import { GOOGLE_API } from '$env/static/private';

  // ERSETZE DURCH DEINEN API-SCHLÜSSEL
  const apiKey: string = GOOGLE_API;
  let mapElement: HTMLDivElement;
  let map: google.maps.Map | undefined;
  let service: google.maps.places.PlacesService | undefined;

  onMount(async () => {
    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
    });

    try {
      await loader.load();

      // Überprüfen, ob die Geolocation API verfügbar ist
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Karte initialisieren
            map = new google.maps.Map(mapElement, {
              center: userLocation,
              zoom: 13,
            });

            service = new google.maps.places.PlacesService(map);

            // Suche nach Suchtberatungsstellen
            const request: google.maps.places.PlaceSearchRequest = {
              location: userLocation,
              radius: 5000, // Suche im Umkreis von 5 km
              type: 'drug_and_alcohol_rehabilitation_center', // Typ für Suchtberatung
              keyword: 'Suchtberatung', // Zusätzliches Keyword
            };

            service.nearbySearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
              if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                for (let i = 0; i < results.length; i++) {
                  createMarker(results[i]);
                }
              } else {
                console.error('Fehler bei der Places API Suche:', status);
              }
            });
          },
          (error: GeolocationPositionError) => {
            // Handle Fehler bei der Positionsbestimmung
            console.error('Fehler beim Abrufen der Position:', error);
            // Optional: Karte mit Standardposition initialisieren
            map = new google.maps.Map(mapElement, {
              center: { lat: 52.5200, lng: 13.4050 }, // Beispiel: Berlin
              zoom: 10,
            });
          }
        );
      } else {
        console.error('Geolocation wird von diesem Browser nicht unterstützt.');
        // Optional: Karte mit Standardposition initialisieren
        map = new google.maps.Map(mapElement, {
          center: { lat: 52.5200, lng: 13.4050 }, // Beispiel: Berlin
          zoom: 10,
        });
      }

    } catch (error) {
      console.error('Fehler beim Laden der Google Maps API:', error);
    }
  });

  function createMarker(place: google.maps.places.PlaceResult) {
    if (!map || !place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location,
    });

    google.maps.event.addListener(marker, 'click', () => {
      // Optional: Info-Fenster mit Details zum Ort anzeigen
      const infowindow = new google.maps.InfoWindow({
        content: `
          <div>
            <strong>${place.name}</strong><br>
            ${place.vicinity}<br>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.vicinity)}" target="_blank">Auf Google Maps anzeigen</a>
          </div>
        `,
      });
      infowindow.open(map, marker);
    });
  }
</script>

<div bind:this={mapElement} style="width: 100%; height: 400px;"></div>

<style>
  /* Optional: CSS für die Karte */
</style>
