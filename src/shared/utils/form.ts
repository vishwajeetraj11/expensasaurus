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