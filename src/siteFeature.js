import * as React from "react";
import { loadModules } from "react-arcgis";
import fetch from "node-fetch";

export default class SiteFeature extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryColorMap: {}
    };
  }

  render() {
    //   if (this.state.layer != null) {
    //     this.state.layer.source = this.state.data[this.props.time];
    //     var renderer = {
    //         type: "unique-value",
    //         field: "siteId",
    //         uniqueValueInfos: this.state.symbols[this.props.time]
    //       };
    //     this.state.layer.renderer = renderer;
        
    //     console.log(this.props.time);
    //     console.log(this.state.data[this.props.time])
    //     console.log(this.state.symbols[this.props.time]);
    // }
    if (this.props.time == this.state.time) {
        console.log(this.props.time);
        return null;
    }
    this.state["time"] = this.props.time;
    var body = {day: Math.floor(this.props.time / 24), hour: this.props.time % 24};
    fetch("http://40.76.22.123:8080/transaction/stats/ajax_all/splitByTime?day=" + body.day + "&hour=" + body.hour, {
        method: "POST",
        body: JSON.stringify(body)
      })
        .then(resp => resp.json())
        .then(respJson => {
            var sites = respJson;
            for (var h = 0; h < sites.length; h++) {
                var s = sites[h];
                s.categories.sort(function(a, b){return b.value - a.value})
            }
          this.state["sites"] = sites;
          loadModules([
            "esri/layers/FeatureLayer",
            "esri/Graphic",
            "esri/geometry/Polygon",
            "esri/Color",
            "esri/renderers/UniqueValueRenderer"
          ])
            .then(
              ([FeatureLayer, Graphic, Polygon, Color, UniqueValueRenderer]) => {
                var obId = 0;
                var data = {};
                var symbols = {};
                var allData = [];
                var allSymbols = [];
                for (var i = 0; i < this.state.sites.length; i++) {
                  var heights = {};
                  var site = this.state.sites[i];
                  var percentBreakdown = "<h1>Site " + site.siteId + "</h1>"
                  for (var k = 0; k < site.categories.length; k++) {
                    var c = site.categories[k];
                    if (symbols[24 * c.day + c.hour] == null) {
                      symbols[24 * c.day + c.hour] = [];
                      data[24 * c.day + c.hour] = [];
                    }
                    if (heights[24 * c.day + c.hour] == null) {
                      heights[24 * c.day + c.hour] = 0.1;
                    }
                    percentBreakdown =
                      percentBreakdown +
                      "<p>" +
                      c.title +
                      ": " +
                      (c.value / site.size) * 100 +
                      "%</p>";
                  }
                  for (var j = 0; j < site.categories.length; j++) {
                    var category = site.categories[j];
                    var time = 24 * category.day + category.hour;
                    this.updateCategoryColorMap(category.title);
                    var descText = "<h1>" + category.title + ": " + category.proportion * 100 + "%</h1><p>$" + category.value + "</p>"
                    var symbol = {
                      type: "polygon-3d",
                      symbolLayers: [
                        {
                          type: "extrude",
                          size: category.value * 50,
                          material: {
                            color: this.state.categoryColorMap[category.title]
                          }
                        }
                      ]
                    };
                    allSymbols.push({ value: obId.toString(), symbol: symbol });
                    symbols[time].push({ value: obId.toString(), symbol: symbol });
                    var scalingFactor = 0.1
                    const rings = [
                      [
                        [site.longitude - scalingFactor, site.latitude - scalingFactor, heights[time]],
                        [site.longitude - scalingFactor, site.latitude + scalingFactor, heights[time]],
                        [site.longitude + scalingFactor, site.latitude + scalingFactor, heights[time]],
                        [site.longitude + scalingFactor, site.latitude - scalingFactor, heights[time]],
                        [site.longitude - scalingFactor, site.latitude - scalingFactor, heights[time]]
                      ]
                    ];
                    heights[time] += category.value * 50;
                    data[time].push(
                      new Graphic({
                        objectId: obId.toString(),
                        attributes: {
                          siteId: obId.toString(),
                          descText: descText,
                          percentBreakdown: percentBreakdown,
                          time: time
                        },
                        geometry: new Polygon({
                          rings: rings,
                          hasZ: true,
                          hasM: false
                        })
                      })
                    );
                    allData.push(data[time][data[time].length - 1]);
                    obId += 1;
                  }
                }
                var renderer = new UniqueValueRenderer({
                  field: "siteId",
                  uniqueValueInfos: symbols[this.props.time]
                });
                var onClickTemplate = {
                  title: "{title}",
                  overwriteActions: true,
                  content: [{type: "text", text: "{descText}"}, {type: "text", text: "{percentBreakdown}"}]
                };
                var layer = new FeatureLayer({
                  source: data[this.props.time],
                  outFields: ["*"],
                  geometryType: "polygon",
                  fields: [
                    {
                      name: "objectId",
                      alias: "objectId",
                      type: "oid"
                    },
                    {
                      name: "siteId",
                      alias: "Site ID",
                      type: "string"
                    }
                  ],
                  popupTemplate: onClickTemplate,
                  renderer: renderer,
                  objectIdField: "objectId"
                });
                if (this.state.layer != null) {
                    this.props.map.layers.remove(this.state.layer);
                }
                this.props.map.add(layer);
                this.state["symbols"] = symbols;
                this.state["data"] = data;
                this.state["layer"] = layer;
                this.state["allSymbols"] = allSymbols;
                this.state["allData"] = allData;
                this.state["time"] = this.props.time;
                return null;
              }
            )
            .catch(err => { console.error(err);  });
        });
        return null;
  }

  updateCategoryColorMap(category) {
    if (this.state.categoryColorMap[category] == null) {
      var randColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
      this.state.categoryColorMap[category] = randColor;
      this.setState({ categoryColorMap: this.state.categoryColorMap });
    }
  }

  componentWillMount() {
    
  }
}