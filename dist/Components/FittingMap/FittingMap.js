import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.esm.browser.js'
import * as directives from '../../vue-resources/vue-directives/__index.js'

import SuperComponent from '../SuperComponent.js'

import { createElement } from '../../helpers.js'

const styleSource = 'dist/Components/FittingMap/style.css';

class FittingMapComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    const propInfos = rendererInstance.data[keyName];

    const props = propInfos.properties;

    var map;

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cmljZS1jb25yYWQiLCJhIjoiY2lpM25jbXVpMDExZXQ4bTBmYzd5cjBhbSJ9.zW17SmAFJRJPf8VjAxpang';

    const btnStyleSheet = `
      background-color: #2a8a56;
      height: 30px;
      width: 30px;
      display: inline-block;
      margin: 0 5px;
      background-size: 80%;
      background-position: center;
      background-repeat: no-repeat;
      cursor: pointer;
    `;

    const { width, height } = propInfos.value;

    const mapContainer = createElement("div", {
      className: "route-map",
      attributes: {
        style: `
          width: ${ width }px;
          height: ${ height }px;
          display: block;
        `,
        //style: 'position: fixed; left: 50px; top: 50px; width: 1000px; height: 800px;',
        id: "map"
      },
      childs: []
    });

    const inputs = props.fieldsDefaults;


    const layer = {
      meta: {
        get viewBox() {
          const center = map.getCenter();
          const bounds = map.getBounds();

          const diffLng = Math.abs(bounds._sw.lng - bounds._ne.lng);
          const diffLat = Math.abs(bounds._sw.lat - bounds._ne.lat);

          return {
            lng: bounds._sw.lng,
            lat: bounds._ne.lat,
            diffLng: diffLng,
            diffLat: -diffLat
          };
        },
        get cubicRatio() {
          const center = map.getCenter();

          return 1 / (Math.cos(Math.PI * (center.lat / 180)));
        }
      },
      data: {
        start: null,
        target: null
      }
    };



    const btns = createElement("div", {
      className: "map-controls",
      attributes: {
        style: `
          margin: 10px 0;
        `
      },
      childs: [
        createElement("div", {
          className: "input-container",
          childs: [
            createElement("span", {
              className: "label"
            }, "Start"),
            createElement("input", {
              attributes: {
                type: "text",
                value: props.fieldsDefaults[0]
              },
              eventListeners: [
                {
                  type: "input",
                  async callback() {
                    inputs[0] = this.value;
                  }
                }
              ]
            })
          ]
        }),
        createElement("div", {
          className: "input-container",
          childs: [
            createElement("span", {
              className: "label"
            }, "Destination"),
            createElement("input", {
              attributes: {
                type: "text",
                value: props.fieldsDefaults[1]
              },
              eventListeners: [
                {
                  type: "input",
                  callback() {
                    inputs[1] = this.value;
                  }
                }
              ]
            })
          ]
        }),
        createElement("div", {
          className: "btn-map btn-refresh",
          attributes: {
            style: btnStyleSheet + `
              background-image: url('data/resources/refresh.svg');
            `
          },
          eventListeners: [
            {
              type: "click",
              async callback(event) {

                const geocodingResultsPromises = inputs.map(async function(query) {
                  const result = await fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?access_token=' + mapboxgl.accessToken);

                  return result.json();
                });

                const geocodingResults = await Promise.all(geocodingResultsPromises);

                const feautures = geocodingResults.map(function(result) {
                  return result.features[0];
                });

                layer.data.start = feautures[0].center;
                layer.data.target = feautures[1].center;


                map.fitBounds([
                  feautures[0].center,
                  feautures[1].center
                ], {
                  maxDuration: 1,
                  padding: 75
                });


                {
                  const { width, height } = propInfos.value;

                  const center = map.getCenter();
                  const zoom = map.getZoom();

                  console.log(layer.data);

                  const responseObj = {
                    geo: {},
                    meta: layer.meta,
                    data: layer.data,
                    center: center,
                    zoom: zoom,
                    width: width,
                    height: height,
                    accessToken: mapboxgl.accessToken
                  };

                  console.log(responseObj);

                  self.value = responseObj;
                }




              }
            }
          ]
        })

      ]
    });


    setTimeout(function() {

      map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [propInfos.value.center.lng, propInfos.value.center.lat],
        zoom: propInfos.value.zoom
      });

      map.getCanvas().style.cursor = 'crosshair';

      map.on('click', function(e) {

        console.log(e);

      });




      map.on("load", function() {


      });
    }, 100);

    const mainCon = createElement("div", {
      className: "map-container",
      childs: [
        mapContainer,
        btns
      ]
    });

    this.root.append(mainCon);

    this.container = this.root;


    //console.log(this.__shadow);




    //return mainCon;
  }
}


export default FittingMapComponent;
