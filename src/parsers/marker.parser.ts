import { tsquery } from '@phenomnomnominal/tsquery';

import { ParserInterface } from './parser.interface.js';
import { TranslationCollection } from '../utils/translation.collection.js';
import { findFunctionCallExpressions, getStringsFromExpression, findEnumDeclaration, getNamedImportAlias } from '../utils/ast-helpers.js';

const MARKER_MODULE_NAME = '@jbouduin/ngx-translate-extract-marker';
const MARKER_IMPORT_NAME = 'marker';
const ENUM_MARKER_IMPORT_NAME = 'enumMarker';

export class MarkerParser implements ParserInterface {
	public extract(source: string, filePath: string): TranslationCollection | null {
		const sourceFile = tsquery.ast(source, filePath);

		let collection: TranslationCollection = new TranslationCollection();

		const markerImportName = getNamedImportAlias(sourceFile, MARKER_MODULE_NAME, MARKER_IMPORT_NAME);
		if (markerImportName) {

			const callExpressions = findFunctionCallExpressions(sourceFile, markerImportName);
			callExpressions.forEach((callExpression) => {
				const [firstArg] = callExpression.arguments;

				if (!firstArg) {
					return;
				}
				const strings = getStringsFromExpression(firstArg);
				collection = collection.addKeys(strings);
			});

		}

		const enumMarkerImportName = getNamedImportAlias(sourceFile, MARKER_MODULE_NAME, ENUM_MARKER_IMPORT_NAME);
		if (enumMarkerImportName) {
			const callExpressions = findFunctionCallExpressions(sourceFile, 'enumMarker');
			callExpressions.forEach((callExpression) => {
				const [firstArg, secondArg] = callExpression.arguments;
				if (!firstArg || !secondArg) {
					return;
				}
				const enumd = findEnumDeclaration(sourceFile, secondArg);
				const prefix = getStringsFromExpression(firstArg);
				enumd.forEach((enumKey: string) => {
					collection = collection.addKeys([`${prefix}${enumKey}`]);
				});
			})
		}
		return collection;
	}
}
