import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./Leafleet.css";
import "../App.css";
import img7 from "../Logo/images/marker-logo-06.png";
import logo from "../Logo/images/newLogo.PNG";
import L from "leaflet";
import step01 from "../Logo/images/step-01.png";
import step02 from "../Logo/images/step-02.png";
import MarkerClusterGroup from "./marker-cluster";

import {
  MapContainer,
  Marker,
  TileLayer,
  ZoomControl,
  useMapEvent,
} from "react-leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import axios from "axios";
import "../style/style.css";
import {
  ModuleCapacityArray,
  SeasonalTiltMonth,
  TiltAngleArray,
} from "../style/constant";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const Leafleet = () => {
  const [zoom, setZoom] = useState(2);
  const [openProjectData, setOpenProjectData] = useState(null);
  const [marker, setmarker] = useState(null);
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [openData, setOpenData] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openCountryDetail, setOpenCountryDetail] = useState(false);
  const [storeCountry, setStoreCountry] = useState([]);
  const [countryHilight, setCountryHilight] = useState(null);

  const [ProjectData, setProjectData] = useState({
    country: null,
    state: null,
    city: null,
    projectCapacity: null,
    moduleType: null,
    moduleCapacity: null,
    inverterType: null,
    structureType: null,
    tiltAngle: null,
    tileAngle1: null,
    tileAngle2: null,
    irradiation: null,
    plantGeneration: null,
    emailID: null,
    phoneNumber: null,
    seasonStartMonth1: null,
    seasonStartMonth2: null,
    seasonEndMonth1: null,
    seasonEndMonth2: null,
  });

  const [locationDetail, setLocationDetail] = useState({
    countryNumberCode: null,
    state: false,
    city: false,
  });
  const ref = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoadingRegister(true);
      const { data } = await axios.post(
        "https://greenenco.in/pvfleet/project-register",
        {
          country: ProjectData.country,
          state: ProjectData.state,
          city: ProjectData.city,
          projectCapacity: parseFloat(ProjectData.projectCapacity),
          moduleType: ProjectData.moduleType,
          moduleCapacity: parseInt(ProjectData.moduleCapacity),
          inverterType: ProjectData.inverterType,
          structureType: ProjectData.structureType,
          season1: ProjectData.seasonStartMonth1
            ? ProjectData.seasonStartMonth1 + "-" + ProjectData.seasonEndMonth1
            : null,
          tiltAngle1: ProjectData.tileAngle1
            ? parseInt(ProjectData.tileAngle1)
            : ProjectData.tiltAngle,
          season2: ProjectData.seasonStartMonth2
            ? ProjectData.seasonStartMonth2 + "-" + ProjectData.seasonEndMonth2
            : null,
          tiltAngle2: parseInt(ProjectData.tileAngle2),
          irradiation: parseFloat(ProjectData.irradiation),
          plantGeneration: parseFloat(ProjectData.plantGeneration),
          emailID: ProjectData.emailID,
          latitude: parseFloat(marker?.lat),
          longitude: parseFloat(marker?.lng),
        }
      );
      if (data) {
        setOpenForm(false);
        getAllProjects();
        setmarker(null);
        setZoom(2);
      }
    } catch (error) {
      alert("Error is " + error.response.data.error);
      console.log("Error is ", error.response.data.error);
    } finally {
      setLoadingRegister(false);
      setProjectData({
        ...ProjectData,
        country: null,
        state: null,
        city: null,
        projectCapacity: null,
        moduleType: null,
        moduleCapacity: null,
        inverterType: null,
        structureType: null,
        tiltAngle: null,
        tileAngle1: null,
        tileAngle2: null,
        irradiation: null,
        plantGeneration: null,
        emailID: null,
        phoneNumber: null,
        seasonStartMonth1: null,
        seasonStartMonth2: null,
        seasonEndMonth1: null,
        seasonEndMonth2: null,
      });
    }
  };
  const GetLocation = () => {
    useMapEvent({
      click(ee) {
        if (!openData) {
          setmarker({ lat: ee.latlng.lat, lng: ee.latlng.lng });
        }
      },
      zoomend: (e) => {},
    });

    useEffect(() => {
      L.DomEvent.disableClickPropagation(ref2.current);
      L.DomEvent.disableScrollPropagation(ref2.current);
      L.DomEvent.disableClickPropagation(ref3.current);
      L.DomEvent.disableScrollPropagation(ref3.current);
      L.DomEvent.disableClickPropagation(ref4.current);
      L.DomEvent.disableClickPropagation(ref5.current);
    });
  };
  window.onclick = (e) => {
    if (setOpenData) {
      setOpenData(false);
    }
  };

  const getAllProjects = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "https://greenenco.in/pvfleet/all-project"
      );
      if (data) {
        setProjects(data?.result);
      }
    } catch (error) {
      console.log("error is ", error.message);
      alert("Error is ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    if (!marker) {
      alert(`Please Select One Location !`);
    } else {
      try {
        setLoading2(true);
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${marker.lat}&lon=${marker.lng}&format=json`
        );
        if (!data.address?.country) {
          alert("Please Select a proper location");
          return;
        }
        console.log("Location detail is ", data);
        setProjectData({
          ...ProjectData,
          country: data?.address?.country,
          state: data.address?.state ? data?.address?.state : null,
          city:
            data.address?.state_district?.charAt(0) >= "A" &&
            data.address?.state_district?.charAt(0) <= "Z"
              ? data.address?.state_district?.replace(" District", "")
              : data.address?.region?.charAt(0) >= "A" &&
                data.address?.region?.charAt(0) <= "Z"
              ? data.address?.region?.replace(" District", "")
              : null,
        });

        setLocationDetail({
          ...locationDetail,
          state: data?.address?.state ? true : false,
          city:
            (data.address?.state_district?.charAt(0) >= "A" &&
              data.address?.state_district?.charAt(0) <= "Z") ||
            (data.address?.region?.charAt(0) >= "A" &&
              data.address?.region?.charAt(0) <= "Z")
              ? true
              : false,
        });
        setOpenForm((v) => !v);
      } catch (error) {
        console.log("Error is ", error.message);
        alert("Error is ", error.message);
      } finally {
        setLoading2(false);
      }
    }
  };

  useMemo(() => {
    if (projects?.length > 0) {
      let newArr = [];
      projects?.map((e, index) => {
        let i = newArr.findIndex((ee) => ee.name === e.Country);
        if (i >= 0) {
          let obj = newArr[i];
          obj["count"] = obj["count"] + 1;
          return newArr.splice(i, obj);
        } else {
          let obj = {};
          obj.name = e.Country;
          obj.count = 1;
          obj.latitude = e.Latitude;
          obj.longitude = e.Longitude;
          return newArr.push(obj);
        }
      });
      newArr.sort((first, second) => (first.name < second.name ? -1 : 1));
      setStoreCountry(newArr);
    }
  }, [projects]);
  useEffect(() => {
    getAllProjects();
  }, []);

  return (
    <>
      <div
        className="form-modal"
        style={{
          height: openForm || loading2 ? "100%" : "0",
          overflow: openForm || loading2 ? "auto" : "hidden",
        }}
      >
        {!loading2 ? (
          <div className="form-div">
            <i
              className="fa-solid fa-xmark form-x-mark"
              onClick={() => {
                setOpenForm(false);
                setProjectData({
                  ...ProjectData,
                  country: null,
                  state: null,
                  city: null,
                });
              }}
            ></i>
            <h2>Fill Project Details</h2>
            <form autoComplete="on" onSubmit={(e) => formSubmitHandler(e)}>
              <div>
                <label htmlFor="country">Country: </label>
                <input
                  type="text"
                  id="country"
                  value={ProjectData.country || ""}
                  readOnly
                ></input>
              </div>
              <div>
                <label htmlFor="state">State: </label>
                <input
                  placeholder="Optional"
                  type="text"
                  id="state"
                  value={ProjectData.state || ""}
                  onChange={(e) =>
                    !locationDetail.state
                      ? setProjectData({
                          ...ProjectData,
                          state: e.target.value,
                        })
                      : null
                  }
                  readOnly={locationDetail.state ? true : false}
                ></input>
              </div>

              <div>
                <label htmlFor="city">City/Region: </label>

                <input
                  placeholder="Optional"
                  type="text"
                  id="city"
                  value={ProjectData.city || ""}
                  onChange={(e) =>
                    !locationDetail.city
                      ? setProjectData({ ...ProjectData, city: e.target.value })
                      : null
                  }
                  readOnly={locationDetail.city ? true : false}
                />
              </div>
              <div>
                <label htmlFor="project-capacity">Capacity: </label>
                <input
                  style={{ paddingRight: "32%" }}
                  type="number"
                  id="project-capacity"
                  value={ProjectData.projectCapacity}
                  onChange={(e) =>
                    setProjectData({
                      ...ProjectData,
                      projectCapacity: e.target.value,
                    })
                  }
                  required
                />
                <span
                  style={{
                    fontSize: "1.9vmin",
                    position: "absolute",
                    right: "0vmin",
                    bottom: "1vmin",
                    padding: "0vmin 1vmin",
                    borderLeft: "1px solid grey",
                  }}
                >
                  MWp
                </span>
              </div>
              <div>
                <label htmlFor="module-type">Module Type: </label>
                <select
                  id="module-type"
                  onChange={(e) => {
                    setProjectData({
                      ...ProjectData,
                      moduleType: e.target.value,
                    });
                  }}
                  required
                >
                  <option selected disabled value="">
                    Select Module Type
                  </option>
                  <option value="Thin-Film (A-SI)">Thin-Film (CdTe)</option>
                  <option value="Polycrystalline">Polycrystalline</option>
                  <option value="Monocrystalline">Monocrystalline</option>
                  <option value="Monocrystalline PERC (Mono-facial)">
                    Monocrystalline PERC (Mono-facial)
                  </option>
                  <option value="Monocrystalline PERC (Bi-facial)">
                    Monocrystalline PERC (Bi-facial)
                  </option>
                  <option value="TOPCon (Mono-facial)">
                    TOPCon (Mono-facial)
                  </option>
                  <option value="TOPCon (Bi-facial)">TOPCon (Bi-facial)</option>
                  <option value="Concentrated PV Cell (CVP)">
                    Concentrated PV Cell (CVP)
                  </option>
                </select>
              </div>
              <div>
                <label htmlFor="module-capacity">Module Capacity (Wp): </label>
                <select
                  id="module-capacity"
                  onChange={(e) => {
                    setProjectData({
                      ...ProjectData,
                      moduleCapacity: e.target.value,
                    });
                  }}
                  required
                >
                  <option selected disabled value="">
                    Select Module Capacity
                  </option>
                  {ModuleCapacityArray?.map((e, index) => {
                    return (
                      <option value={e} key={e}>
                        {e}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label htmlFor="inverter-type">Inverter Type: </label>
                <select
                  id="inverter-type"
                  onChange={(e) => {
                    setProjectData({
                      ...ProjectData,
                      inverterType: e.target.value,
                    });
                  }}
                  required
                >
                  <option selected disabled value="">
                    Select Inverter Type
                  </option>
                  <option value="String Inverter">String Inverter</option>
                  <option value="Central Inverter">Central Inverter</option>
                </select>
              </div>
              <div>
                <label htmlFor="structure-type">Structure Type: </label>

                <select
                  id="structure-type"
                  onChange={(e) => {
                    if (e.target.value !== "Seasonal Tilt") {
                      setProjectData({
                        ...ProjectData,
                        tileAngle1: null,
                        tileAngle2: null,
                        seasonStartMonth1: null,
                        seasonStartMonth2: null,
                        seasonEndMonth1: null,
                        seasonEndMonth2: null,
                        structureType: e.target.value,
                      });
                    } else {
                      setProjectData({
                        ...ProjectData,
                        tiltAngle: null,
                        structureType: e.target.value,
                      });
                    }
                  }}
                  required
                >
                  <option selected disabled value="">
                    Select Structure Type
                  </option>
                  <option value="Fixed Tilt">Fixed Tilt</option>
                  <option value="Seasonal Tilt">Seasonal Tilt</option>
                  <option value="Tracker Single Axis">
                    Tracker Single Axis
                  </option>
                  <option value="Tracker Double Axis">
                    Tracker Double Axis
                  </option>
                </select>
              </div>

              {ProjectData.structureType === "Seasonal Tilt" && (
                <>
                  <div className="tilt-month">
                    <label htmlFor="season1">Season 1:</label>
                    <div>
                      <select
                        id="season1-start-month"
                        onChange={(e) => {
                          setProjectData({
                            ...ProjectData,
                            seasonStartMonth1: e.target.value,
                          });
                        }}
                        required
                      >
                        <option selected disabled value="">
                          Start Month
                        </option>
                        {SeasonalTiltMonth.map((e, index) => {
                          return <option value={e}>{e}</option>;
                        })}
                      </select>
                      <select
                        id="season1-end-month"
                        onChange={(e) => {
                          setProjectData({
                            ...ProjectData,
                            seasonEndMonth1: e.target.value,
                          });
                        }}
                        required
                      >
                        <option selected disabled value="">
                          End Month
                        </option>
                        {SeasonalTiltMonth.map((e, index) => {
                          return <option value={e}>{e}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tilt-angle-01">Tilt Angle(deg): </label>
                    <select
                      id="tilt-angle-01"
                      onChange={(e) => {
                        setProjectData({
                          ...ProjectData,
                          tileAngle1: e.target.value,
                        });
                      }}
                      required
                    >
                      <option selected disabled value="">
                        Select Tilt Angle
                      </option>
                      {TiltAngleArray.map((e, index) => {
                        return (
                          <option value={e} key={index}>
                            {e}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="tilt-month">
                    <label htmlFor="season2">Season 2:</label>
                    <div>
                      <select
                        id="season2-start-month"
                        onChange={(e) => {
                          setProjectData({
                            ...ProjectData,
                            seasonStartMonth2: e.target.value,
                          });
                        }}
                        required
                      >
                        <option selected disabled value="">
                          Start Month
                        </option>
                        {SeasonalTiltMonth.map((e, index) => {
                          return <option value={e}>{e}</option>;
                        })}
                      </select>
                      <select
                        id="season2-end-month"
                        onChange={(e) => {
                          setProjectData({
                            ...ProjectData,
                            seasonEndMonth2: e.target.value,
                          });
                        }}
                        required
                      >
                        <option selected disabled value="">
                          End Month
                        </option>
                        {SeasonalTiltMonth.map((e, index) => {
                          return <option value={e}>{e}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tilt-angle-02">Tilt Angle(deg): </label>
                    <select
                      id="tilt-angle-02"
                      onChange={(e) => {
                        setProjectData({
                          ...ProjectData,
                          tileAngle2: e.target.value,
                        });
                      }}
                      required
                    >
                      <option selected disabled value="">
                        Select Tilt Angle
                      </option>
                      {TiltAngleArray.map((e, index) => {
                        return (
                          <option value={e} key={index}>
                            {e}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}

              {ProjectData.structureType !== "Seasonal Tilt" && (
                <div>
                  <label htmlFor="tilt-angle">Tilt Angle (deg): </label>
                  <select
                    id="tilt-angle"
                    onChange={(e) => {
                      setProjectData({
                        ...ProjectData,
                        tiltAngle: e.target.value,
                      });
                    }}
                    required
                  >
                    <option selected disabled value="">
                      Select Tilt Angle
                    </option>
                    {TiltAngleArray.map((e, index) => {
                      return (
                        <option value={e} key={index}>
                          {e}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="irradiation">Annual Irradiation:</label>
                <input
                  style={{ paddingRight: "32%" }}
                  type="number"
                  id="irradiation"
                  onChange={(e) => {
                    setProjectData({
                      ...ProjectData,
                      irradiation: e.target.value,
                    });
                  }}
                  required
                />
                <span
                  style={{
                    fontSize: "1.9vmin",
                    position: "absolute",
                    right: "0vmin",
                    bottom: "1vmin",
                    padding: "0 1vmin",
                    borderLeft: "1px solid grey",
                  }}
                >
                  KWh/m<sup>2</sup>
                </span>
              </div>
              <div>
                <label htmlFor="irradiation">Plant Generation: </label>
                <input
                  style={{ paddingRight: "32%" }}
                  type="number"
                  id="plant-generation"
                  onChange={(e) => {
                    setProjectData({
                      ...ProjectData,
                      plantGeneration: e.target.value,
                    });
                  }}
                  required
                />
                <span
                  style={{
                    fontSize: "1.9vmin",
                    position: "absolute",
                    right: "0vmin",
                    bottom: "1vmin",
                    padding: "0 1vmin",
                    borderLeft: "1px solid grey",
                  }}
                >
                  MWh
                </span>
              </div>
              <div
                style={{
                  gridColumnStart:
                    ProjectData.structureType === "Seasonal Tilt" ? "1" : "2",
                  gridColumnEnd:
                    ProjectData.structureType === "Seasonal Tilt" ? "3" : "3",
                }}
              >
                <label htmlFor="email">Email Id: </label>
                <input
                  type="email"
                  id="email"
                  onChange={(e) => {
                    setProjectData({
                      ...ProjectData,
                      emailID: e.target.value,
                    });
                  }}
                  required
                />
              </div>

              <div>
                <input
                  type="submit"
                  value={loadingRegister ? "Loading..." : "Submit"}
                />
              </div>
            </form>
          </div>
        ) : (
          <>
            <h1 style={{ color: "white" }}>Please Wait...</h1>
          </>
        )}
      </div>
      <div
        style={{
          padding: "2vmin",
          height: "100%",
          display: "flex",
          // alignItems: "center",
          // justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div className="main-container-1">
          <div>
            <div>
              <span>Project Locations</span>
              <img
                src={img7}
                height={"25px"}
                width={"25px"}
                style={{
                  // border:"2px solid red"
                  position: "relative",
                  top: "3px",
                }}
                alt="Project-Location"
              />
              <span
                style={{ height: "15px", borderLeft: "3px solid transparent" }}
              ></span>
              <span>Your location</span>
              <svg
                height={""}
                width={"25px"}
                viewBox="0 0 512 512"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                fill="rgb(4, 142, 173)"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <title>location</title>{" "}
                  <g
                    id="Page-1"
                    stroke="none"
                    strokeWidth="1"
                    fill="none"
                    fillRule="evenodd"
                  >
                    {" "}
                    <g
                      id="Combined-Shape"
                      fill="rgb(14, 200, 241)"
                      transform="translate(106.666667, 42.666667)"
                    >
                      {" "}
                      <path d="M149.333333,7.10542736e-15 C231.807856,7.10542736e-15 298.666667,66.8588107 298.666667,149.333333 C298.666667,174.270044 292.571852,197.766489 281.750846,218.441128 L149.333333,448 L19.9831547,224.008666 C7.25333333,202.026667 2.84217094e-14,176.537017 2.84217094e-14,149.333333 C2.84217094e-14,66.8588107 66.8588107,7.10542736e-15 149.333333,7.10542736e-15 Z M149.333333,42.6666667 C90.42296,42.6666667 42.6666667,90.42296 42.6666667,149.333333 C42.6666667,166.273109 46.5745408,182.526914 53.969702,197.200195 L57.5535689,203.746216 L149.333333,362.666667 L241.761134,202.626841 C251.054097,186.579648 256,168.390581 256,149.333333 C256,90.42296 208.243707,42.6666667 149.333333,42.6666667 Z M149.333333,85.3333333 C184.679557,85.3333333 213.333333,113.987109 213.333333,149.333333 C213.333333,184.679557 184.679557,213.333333 149.333333,213.333333 C113.987109,213.333333 85.3333333,184.679557 85.3333333,149.333333 C85.3333333,113.987109 113.987109,85.3333333 149.333333,85.3333333 Z M149.333333,128 C137.551259,128 128,137.551259 128,149.333333 C128,161.115408 137.551259,170.666667 149.333333,170.666667 C161.115408,170.666667 170.666667,161.115408 170.666667,149.333333 C170.666667,137.551259 161.115408,128 149.333333,128 Z">
                        {" "}
                      </path>{" "}
                    </g>{" "}
                  </g>{" "}
                </g>
              </svg>
            </div>
            <div className="logo-container">
              <div>
                <img src={logo} alt="GreenEnco-Logo" />
              </div>
            </div>
            <div>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://greenenco.co.uk"
                className="step-02-button"
              >
                <button>Visit Our Website</button>
              </a>
            </div>
          </div>
        </div>
        {loading ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <h3>Please Wait...</h3>
          </div>
        ) : (
          <MapContainer
            center={[22.577152, 88.3720192]}
            zoom={zoom}
            minZoom={window.innerWidth > 500 ? 2 : 1}
            maxZoom={15}
            ref={ref}
            style={{
              width: "100%",
              height: "100%",
              cursor: "default",
            }}
            worldCopyJump={true}
            whenReady={(e) => {
              if (ref?.current) {
              }
            }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <ZoomControl position="bottomleft" />
            <div className="step-container" ref={ref5}>
              <div>
                <img src={step01} alt="Setp-01" />
                <span>
                  Mark A Location{" "}
                  {marker && (
                    <i
                      style={{
                        color: "green",
                        position: "relative",
                        top: "0.2vmin",
                        left: "0.2vmin",
                      }}
                      className="fa-solid fa-circle-check"
                    ></i>
                  )}
                </span>
              </div>
              <div
                onClick={() =>
                  marker ? submitHandler() : alert("Please Mark A Location")
                }
              >
                <img src={step02} alt="Setp-02" />
                <span>
                  Submit Project Details{" "}
                  {openForm && (
                    <i
                      style={{
                        color: "green",
                        position: "relative",
                        top: "0.2vmin",
                        left: "0.2vmin",
                      }}
                      className="fa-solid fa-circle-check"
                    ></i>
                  )}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => null}
            >
              <span
                style={{
                  fontSize: "1.5vmax",
                  position: "absolute",
                  top: "1vmin",
                  zIndex: 1111,
                  color: "black",
                  fontWeight: 1000,
                  width: "fit-content",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
              >
                Welcome To pvFLEET Performance Dashboard
              </span>
            </div>
            <span
              className="worldwide-project-link-text"
              style={{
                position: "absolute",
                top: "1vmin",
                right: "1.5vmin",
                zIndex: 1111,
                color: "black",
                fontWeight: 1000,
                opacity: 0.8,
                cursor: "pointer",
                fontSize: "1.5vmax",
                display: "flex",
                alignItems: "center",
                gap: "1vmin",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenCountryDetail((v) => !v);
              }}
              ref={ref4}
            >
              <span>Worldwide Projects</span>
              <i className="fa-solid fa-bars"></i>
            </span>

            <div
              className="country-detail"
              style={{
                width: openCountryDetail ? "35vmin" : "0",
              }}
              onClick={(e) => e.stopPropagation()}
              ref={ref3}
            >
              <div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCountryDetail((v) => !v);
                  }}
                >
                  Close
                </div>
                <div>
                  <span>Country Name</span>
                  <span>Projects</span>
                </div>
              </div>

              {storeCountry?.map((e, index) => {
                return (
                  <div
                    id={countryHilight === e.name ? "selected-country" : ""}
                    style={{
                      backgroundColor:
                        countryHilight === e.name ? "orangered" : "transparent",
                    }}
                    onClick={() => {
                      setCountryHilight(e.name);
                      ref.current.flyTo(
                        { lat: e.latitude, lng: e.longitude },
                        ref.current.getZoom(),
                        {
                          animate: true,
                          duration: 0.5,
                        }
                      );
                    }}
                  >
                    <span>{e.name}</span>
                    <span>{e.count}</span>
                  </div>
                );
              })}
            </div>
            <div
              className="detail-container-1"
              style={{
                height: openData ? "75vmin" : "0",
                border: openData ? "2px solid orange" : "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              ref={ref2}
            >
              <i
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenData(false);
                }}
                className="fa-solid fa-xmark x-mark"
              ></i>
              <div>
                <h2>Project Details</h2>
              </div>
              <div>
                <div>
                  <p>Project Location </p>
                  <span>
                    {openProjectData?.Country}
                    {openProjectData?.State !== null
                      ? ", " + openProjectData?.State
                      : ""}
                    {openProjectData?.CityOrRegion !== null
                      ? ", " + openProjectData?.CityOrRegion
                      : ""}
                  </span>
                </div>
                <div>
                  <p>Project Capacity</p>
                  <span>{openProjectData?.ProjectCapacity_mWp} MWp</span>
                </div>
                <div>
                  <p>Module Details</p>
                  <span>
                    {openProjectData?.ModuleType +
                      ", " +
                      openProjectData?.ModuleCapacity_Wp +
                      " Wp"}
                  </span>
                </div>
                <div>
                  <p>Inverter Type</p>
                  <span>{openProjectData?.InverterType}</span>
                </div>
                <div>
                  <p>Structure Type</p>
                  <span>{openProjectData?.StructureType}</span>
                </div>
                {openProjectData?.StructureType === "Seasonal Tilt" && (
                  <>
                    <div>
                      <p>Season 1 and Tilt Angle</p>
                      <span>
                        {openProjectData?.Season1}, {openProjectData.TiltAngle1}
                        {" deg"}
                      </span>
                    </div>
                    <div>
                      <p>Season 2 and Tilt Angle</p>
                      <span>
                        {openProjectData?.Season2}, {openProjectData.TiltAngle2}
                        {" deg"}
                      </span>
                    </div>
                  </>
                )}

                {openProjectData?.StructureType !== "Seasonal Tilt" && (
                  <div>
                    <p>Tilt Angle</p>
                    <span>
                      {openProjectData?.TiltAngle1}
                      {" deg"}
                    </span>
                  </div>
                )}
                <div>
                  <p>Irradiation</p>
                  <span>
                    {openProjectData?.AnnualIrradiation} KWh/m<sup>2</sup>
                  </span>
                </div>
                <div>
                  <p>Plant Generation</p>
                  <span>{openProjectData?.PlantGeneration} KWh</span>
                </div>
              </div>
            </div>
            {marker && (
              <Marker
                icon={DefaultIcon}
                draggable={true}
                position={[marker.lat, marker.lng]}
                eventHandlers={{
                  click: () => {
                    setmarker(null);
                  },
                }}
              ></Marker>
            )}
            <MarkerClusterGroup
              onclick={(e) => {
                if (openData) {
                  setOpenData(false);
                }
                e.originalEvent.stopPropagation();

                if (ref.current.getZoom() <= 12) {
                  ref.current.flyTo(
                    { lat: e.latlng.lat, lng: e?.latlng.lng },
                    ref.current.getZoom() + 1.5,
                    {
                      animate: true,
                      duration: 0.5,
                    }
                  );
                }
              }}
              eventHandlers={{
                click: (c) => {
                  c.originalEvent.stopPropagation();

                  let find = projects?.find(
                    (f) =>
                      parseFloat(f.Latitude) === parseFloat(c.latlng.lat) &&
                      parseFloat(f.Longitude) === parseFloat(c.latlng.lng)
                  );

                  if (find) {
                    ref.current.flyTo(
                      { lat: c?.latlng.lat, lng: c?.latlng.lng },
                      ref.current.getZoom(),
                      {
                        animate: true,
                        duration: 0.5,
                      }
                    );
                    setOpenProjectData(find);
                    setOpenData(true);
                  }
                },
              }}
              onClusterClick={(cluster) => {}}
            >
              {projects?.map((eee, index) => {
                let DefaultIcon = L.divIcon({
                  className: "defaultIcon",
                  html: `
                    <img src=${img7}  id=defaultIconImg />
                     <span id=defaultIconImgSpan ></span>
                            `,
                  // iconSize: [25, 25],
                  iconAnchor: [27, 20],
                });
                return (
                  <Marker
                    data={eee}
                    key={index}
                    icon={DefaultIcon}
                    position={[eee?.Latitude, eee?.Longitude]}
                  />
                );
              })}
            </MarkerClusterGroup>
            <GetLocation />
          </MapContainer>
        )}
      </div>
    </>
  );
};

export default Leafleet;

// "Ganjam"
// latitude
// "19.38705000"
// longitude
// "85.05079000"

// "Cuttack"
// latitude
// "20.50000000"
// longitude
// "86.25000000"
