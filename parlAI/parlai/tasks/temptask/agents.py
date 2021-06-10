#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import os
import json
from parlai.core.teachers import FixedDialogTeacher
from parlai.core.teachers import ParlAIDialogTeacher
from parlai.utils.io import PathManager
from .build import build
import copy

def _path(opt):
    build(opt)
    suffix = ''
    dt = opt['datatype'].split(':')[0]
    if dt == 'train':
        suffix = 'train'
    elif dt == 'test':
        suffix = 'test'
    elif dt == 'valid':
        suffix = 'valid'
    return os.path.join(
        opt['datapath'],
        'example',
        '_{suffix}.txt'.format(suffix=suffix),
    )
class DefaultTeacher(ParlAIDialogTeacher):
    def __init__(self, opt, shared=None):
        build(opt)
        opt = copy.deepcopy(opt)
        opt['datafile'] = _path(opt)
        # get datafile
        opt['parlaidialogteacher_datafile'] = _path(opt)

        super().__init__(opt, shared)
