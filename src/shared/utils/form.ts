import { MutableState, Tools } from 'final-form';

type mutatorsType = (
    [name, value]: any,
    state: MutableState<object, object>,
    utils: Tools<object, object>
) => void;

export const setError: mutatorsType = ([fieldName, error], state) => {
    if (error !== undefined) {
        if (state.formState.errors?.[fieldName]) {
            state.formState.errors[fieldName] = error;
        } else {
            state.formState.errors = {
                ...state.formState.errors,
                [fieldName]: error
            };
        }

    } else {
        delete state.formState.errors?.[fieldName];
    }
};

export const setFieldValue: mutatorsType = ([name, value], state, utils) => {
    utils.changeValue(state, name, () => value);
};

export const defaultMutators = { setError, setFieldValue };


export const validateExpenseForm = (values: any) => {
    let errors: any = {};

    if (!values.title) {
        errors.title = "Title is required";
    }

    if (!values.description) {
        errors.description = "Description is required";
    }

    if (!values.amount) {
        errors.amount = "Amount is required";
    }

    if (!values.category) {
        errors.category = "Category is required";
    }

    if (!values.date) {
        errors.date = "Date is required";
    }

    if (!values.currency) {
        errors.currency = "Currency is required";
    }

    return errors;
}

export const validateBudgetForm = (values: any) => {
    const errors: any = {};
    return errors;
}