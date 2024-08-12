/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require('path');
const assert = require('assert');
const {describe, it} = require('mocha');
const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const {deleteJob} = require('./batchClient_operations');
const batchClient = new BatchServiceClient();

describe('Create batch NFS job', async () => {
  const jobName = 'batch-nfs-job';
  const region = 'europe-central2';

  let projectId;

  before(async () => {
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await deleteJob(batchClient, projectId, region, jobName);
  });

  it('should create a new job with NFS', async () => {
    const expectedVolumes = [
      {
        mountOptions: [],
        mountPath: '/mnt/disks',
        nfs: {server: '0.0.0.0', remotePath: '/your_nfs_path'},
        source: 'nfs',
      },
    ];

    const response = execSync('node ./create/create_nfs_job.js', {
      cwd,
    });

    assert.deepEqual(
      JSON.parse(response).taskGroups[0].taskSpec.volumes,
      expectedVolumes
    );
  });
});
