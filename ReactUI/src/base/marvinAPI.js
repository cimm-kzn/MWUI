import { MARVIN_EDITOR_IS_EMPTY, MARVIN_ID } from '../config';

/**
 * Default settings for marvin js
 * @type {{width: number, height: number, typeImg: string, zoomMode: string}}
 */
const SETTINGS = {
  width: 700,
  height: 450,
  typeImg: 'image/png',
  zoomMode: 'autoshrink',
};

/**
 * The function of returned MarvinJSUtil when DOM is load.
 * @returns { Promise } MarvinJSUtil
 */
const windowsLoad = () => new Promise((resolve) => { window.onload = resolve(window.MarvinJSUtil); });

/**
 * The function of returned Marvin editor.
 * @returns { Promise } MarvinEditor
 */
const getEditor = editorID => windowsLoad()
  .then(marvinJSUtil => marvinJSUtil.getEditor(editorID));

/**
 * The function of returned Marvin package.
 * @returns { Promise } MarvinPakage
 */
const getPackage = editorID => windowsLoad()
  .then(marvinJSUtil => marvinJSUtil.getPackage(editorID));

/**
 * The function of export mrv format of data from editor.
 * @param {string} id of marvin iframe
 * @returns { Promise } mrv data
 */
export const exportCml = (editorID = MARVIN_ID) => getEditor(editorID)
  .then(sketcher => sketcher.exportStructure('mrv'));

/**
 * The function of clean marvin editor.
 * @returns { Promise }
 */
export const clearEditor = (editorID = MARVIN_ID) => getEditor(editorID)
  .then((sketcher) => {
    sketcher.importStructure('mrv', MARVIN_EDITOR_IS_EMPTY);
  });

/**
 * The function of convert mrv format to base64 format (image format).
 * @param {string} id of marvin iframe
 * @returns { Promise } base64
 */
export const convertCmlToBase64 = (cml, editorID = MARVIN_ID) => new Promise((resolve) => {
  getPackage(editorID)
    .then((marvinName) => {
      marvinName.onReady(() => {
        const c = marvinName.ImageExporter.mrvToDataUrl(cml,
          SETTINGS.typeImg, SETTINGS);
        resolve(c);
      });
    });
});

/**
 * The function of convert mrv format to base64 format (image format).
 * @param {array} arrStructures
 * @param {object} settings
 * @param {string} editorID
 * @returns { Promise } array of push base64
 */
export const convertCmlToBase64Arr = (arrStructures, settings = SETTINGS, editorID = MARVIN_ID) => new Promise((resolve) => {
  getPackage(editorID)
    .then((marvinName) => {
      marvinName.onReady(() => {
        const c = arrStructures.map((structure) => {
          structure.base64 = marvinName.ImageExporter.mrvToDataUrl(structure.data,
            SETTINGS.typeImg, settings);
          return structure;
        });
        resolve(c);
      });
    });
});
/**
 * Import data from marvin editor.
 * @param cml
 * @param editorID
 * @returns { Promise }
 */
export const importCml = (cml, editorID = MARVIN_ID) => getEditor(editorID)
  .then(sketcher => sketcher.importStructure('mrv', cml));

/**
 * Convert text to base64
 * @param text
 * @param editorID
 * @returns { Promise }
 */
export const textToCml = (text, editorID = MARVIN_ID) => getEditor(editorID)
  .then(sketcher => sketcher.importStructure('auto', text)
    .then(() => sketcher.exportStructure('mrv')),
  );

