const SETTINGS = {
    width: 700,
    height: 450,
    typeImg: "image/png",
    zoomMode: 'autoshrink'
};

// const marvinPackage = (type, success, err1) => {
//     let marvinJSUtil = window.MarvinJSUtil;
//     switch (type) {
//         case 'PACKAGE':
//             marvinJSUtil = marvinJSUtil.getPackage("marvinjs-iframe");
//             break;
//         case 'EDITOR':
//             marvinJSUtil = marvinJSUtil.getEditor("marvinjs-iframe");
//             break;
//         default:
//             err1('type package error');
//     }
//     marvinJSUtil.then(
//         marvin => {
//             success(marvin);
//         },
//         error => {
//             err1(error);
//         }
//     )
// };

export const cmlToBase64 = (cml, success, err) => {
    window.MarvinJSUtil.getPackage("marvinjs")
        .then(
        (marvinName) => {
            marvinName.onReady(() => {
                let base64 = marvinName.ImageExporter.mrvToDataUrl(cml,
                    SETTINGS.typeImg, SETTINGS);
                success(base64);
            });
        },
        (error) => {
            err(error);
        }
    )
};
//
export const importCml = (cml, err) => {
    window.MarvinJSUtil.getEditor("#marvinjs")
        .then(
        (sketcher) => {
            sketcher.importStructure("mrv", cml);
        },
        (error) => {
            err(error);
        }
    )
};
//
// export const exportCml = (success, err) => {
//     marvinPackage('EDITOR',
//         (sketcher) => {
//             sketcher.exportStructure("mrv")
//                 .then(
//                     (cml) => {
//                         success(cml)
//                     },
//                     (error) => {
//                         err(error);
//                     });
//         },
//         (error) => {
//             err(error);
//         }
//     )
// };

export const exportCmlBase64 = (success, err) => {
    window.MarvinJSUtil.getEditor("#marvinjs")
        .then(
        (sketcher) => {
            sketcher.exportStructure("mrv")
                .then(
                    (cml) => {
                        cmlToBase64(cml,
                            (base64) => {
                                success({cml: cml, base64: base64});
                            },
                            (error) => {
                                err(error);
                            }
                        )
                    },
                    (error) => {
                        err(error);
                    });
        }
    )
};

export const clearMarvin = (err) => {
    importCml('<cml><MDocument></MDocument></cml>',
        (error) => {
            err(error);
        }
    )
};

export const addBase64Arr = (arrCml, success) => {
    window.MarvinJSUtil.getPackage("marvinjs")
        .then(
            (marvinName) => {
                marvinName.onReady(() => {
                    let tt = arrCml.map((obj) => {
                        obj.base64 = marvinName.ImageExporter.mrvToDataUrl(obj.data,
                            SETTINGS.typeImg, SETTINGS);
                        return obj;
                    });
                    success(tt);
                });
            }
        )
};