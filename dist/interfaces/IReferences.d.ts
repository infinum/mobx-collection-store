import IExternalRef from './IExternalRef';
import IType from './IType';
/**
 * Model references mapping interface
 *
 * @interface IReferences
 */
interface IReferences {
    [name: string]: IType | IExternalRef;
}
export default IReferences;
