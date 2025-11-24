const express = require('express');
console.log('Express loaded');
try {
    const config = require('./dist/config').default;
    console.log('Config loaded', config);
} catch (e) {
    console.error('Config failed', e);
}
