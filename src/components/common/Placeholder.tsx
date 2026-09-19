/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const Placeholder: React.FC<{ name: string }> = ({ name }) => (
  <div className="py-20 text-center">
    <h1 className="text-4xl font-bold mb-4">{name}</h1>
    <p className="text-gray-500">এই পেজটি শীঘ্রই আসছে।</p>
  </div>
);

export default Placeholder;
