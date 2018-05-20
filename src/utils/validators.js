const isHexColor = (value) => {
    return /^#[0-9A-F]{6}$/i.test(value);
};

export { isHexColor };
