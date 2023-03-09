import { tsquery } from '@phenomnomnominal/tsquery';

import { ParserInterface } from './parser.interface.js';
import { TranslationCollection } from '../utils/translation.collection.js';
import { findFunctionCallExpressions, getStringsFromExpression, findEnumDeclaration } from '../utils/ast-helpers.js';

export type EnumObject = { [key: string]: number | string };
export function marker<T extends string | string[]>(key: T): T {
	return key;
}

export function enumMarker<T extends EnumObject>(prefix: string, _e: T): string {
	return prefix;
}

export class MarkerParser implements ParserInterface {
	public extract(source: string, filePath: string): TranslationCollection | null {
		const sourceFile = tsquery.ast(source, filePath);

		let collection: TranslationCollection = new TranslationCollection();

		let callExpressions = findFunctionCallExpressions(sourceFile, 'marker');
		callExpressions.forEach((callExpression) => {
			const [firstArg] = callExpression.arguments;

			if (!firstArg) {
				return;
			}
			const strings = getStringsFromExpression(firstArg);
			// console.log(strings);
			collection = collection.addKeys(strings);
		});


		callExpressions = findFunctionCallExpressions(sourceFile, 'enumMarker');
		callExpressions.forEach((callExpression) => {
			const [firstArg, secondArg] = callExpression.arguments;
			if (!firstArg || !secondArg) {
				return;
			}
			const enumd = findEnumDeclaration(sourceFile, secondArg);
			const prefix = getStringsFromExpression(firstArg);
			console.log(enumd);
			enumd.forEach((enumKey: string) => {
				collection = collection.addKeys([`${prefix}${enumKey}`]);
			});
		})
		return collection;
	}
}
