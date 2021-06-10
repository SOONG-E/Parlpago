#!/usr/bin/env python3

# Copyright (c) Facebook, Inc. and its affiliates.
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.
"""
Basic script which allows local human keyboard input to talk to a trained model.

## Examples

```shell
parlai interactive --model-file "zoo:tutorial_transformer_generator/model"
```

When prompted, enter something like: `Bob is Blue./nWhat is Bob?`

Input is often model or task specific, but in drqa, it is always
`context '/n' question`.
"""
from parlai.core.params import ParlaiParser
from parlai.core.agents import create_agent
from parlai.core.worlds import create_task
from parlai.core.script import ParlaiScript, register_script
from parlai.utils.world_logging import WorldLogger
from parlai.agents.local_human.local_human import LocalHumanAgent
import parlai.utils.logging as logging
from parlai.core.opt import Opt
import random
#<class 'parlai.core.opt.Opt'>
import socket


HOST = '127.0.0.1'
PORT =  7779

'''
opt = Opt({'init_opt': None, 'allow_missing_init_opts': False, 'task': 'interactive', 'download_path': None, 'loglevel': 'info', 'datatype': 'train', 'image_mode': 'raw', 'hide_labels': False, 'multitask_weights': [1], 'batchsize': 1, 'dynamic_batching': None, 'verbose': False, 'datapath': 'C:/Users/IT/Desktop/ParlAI-master/ParlAI-master/data', 'model': None, 'model_file': '/home/pslab20/Desktop/ParlAI-master/models/dodecadialogue/daily_dialog_ft/model', 'init_model': None, 'dict_class': 'parlai.core.dict:DictionaryAgent', 'display_examples': False, 'display_prettify': False, 'display_add_fields': '', 'interactive_task': True, 'outfile': '', 'save_format': 'conversations', 'local_human_candidates_file': None, 'single_turn': False, 'log_keep_fields': 'all', 'image_size': 256, 'image_cropsize': 224, 'embedding_size': 300, 'n_layers': 2, 'ffn_size': 300, 'dropout': 0.0, 'attention_dropout': 0.0, 'relu_dropout': 0.0, 'n_heads': 2, 'learn_positional_embeddings': False, 'embeddings_scale': True, 'n_positions': None, 'n_segments': 0, 'variant': 'aiayn', 'activation': 'relu', 'output_scaling': 1.0, 'share_word_embeddings': True, 'n_encoder_layers': -1, 'n_decoder_layers': -1, 'model_parallel': False, 'beam_size': 5, 'beam_min_length': 10, 'beam_context_block_ngram': 3, 'beam_block_ngram': 3, 'beam_block_full_context': True, 'beam_length_penalty': 0.65, 'skip_generation': False, 'inference': 'beam', 'topk': 10, 'topp': 0.9, 'beam_delay': 30, 'beam_block_list_filename': None, 'temperature': 1.0, 'compute_tokenized_bleu': False, 'interactive_mode': True, 'embedding_type': 'random', 'embedding_projection': 'random', 'fp16': False, 'fp16_impl': 'safe', 'force_fp16_tokens': False, 'optimizer': 'sgd', 'learningrate': 1, 'gradient_clip': 0.1, 'adam_eps': 1e-08, 'adafactor_eps': (1e-30, 0.001), 'momentum': 0, 'nesterov': True, 'nus': (0.7,), 'betas': (0.9, 0.999), 'weight_decay': None, 'rank_candidates': False, 'truncate': -1, 'text_truncate': None, 'label_truncate': None, 'history_reversed': False, 'history_size': -1, 'person_tokens': False, 'split_lines': False, 'use_reply': 'label', 'add_p1_after_newln': False, 'delimiter': '\n', 'history_add_global_end_token': None, 'special_tok_lst': None, 'gpu': -1, 'no_cuda': False, 'dict_file': None, 'dict_initpath': None, 'dict_language': 'english', 'dict_max_ngram_size': -1, 'dict_minfreq': 0, 'dict_maxtokens': -1, 'dict_nulltoken': '__null__', 'dict_starttoken': '__start__', 'dict_endtoken': '__end__', 'dict_unktoken': '__unk__', 'dict_tokenizer': 're', 'dict_lower': False, 'bpe_debug': False, 'dict_textfields': 'text,labels', 'bpe_vocab': None, 'bpe_merge': None, 'bpe_add_prefix_space': None, 'bpe_dropout': None, 'lr_scheduler': 'reduceonplateau', 'lr_scheduler_patience': 3, 'lr_scheduler_decay': 0.5, 'max_lr_steps': -1, 'invsqrt_lr_decay_gamma': -1, 'warmup_updates': -1, 'warmup_rate': 0.0001, 'update_freq': 1, 'image_features_dim': 2048, 'image_encoder_num_layers': 1, 'n_image_tokens': 1, 'n_image_channels': 1, 'include_image_token': True, 'image_fusion_type': 'late', 'parlai_home': 'C:/Users/IT/Desktop/ParlAI-master/ParlAI-master', 'override': {'model_file': 'C:/Users/IT/Desktop/ParlAI-master/ParlAI-master/data/models/dodecadialogue/daily_dialog_ft/model', 'inference': 'beam', 'beam_size': 5, 'beam_min_length': 10, 'beam_block_ngram': 3, 'beam_context_block_ngram': 3}, 'starttime': 'Mar04_15-57'} )
'''

def setup_args(parser=None):
    if parser is None:
        parser = ParlaiParser(
            True, True, 'Interactive chat with a model on the command line'
        )
    parser.add_argument('-d', '--display-examples', type='bool', default=False)
    parser.add_argument(
        '--display-prettify',
        type='bool',
        default=False,
        help='Set to use a prettytable when displaying '
        'examples with text candidates',
    )
    parser.add_argument(
        '--display-add-fields',
        type=str,
        default='',
        help='Display these fields when verbose is off (e.g., "--display-add-fields label_candidates,beam_texts")',
    )
    parser.add_argument(
        '-it',
        '--interactive-task',
        type='bool',
        default=True,
        help='Create interactive version of task',
    )
    parser.add_argument(
        '--outfile',
        type=str,
        default='',
        help='Saves a jsonl file containing all of the task examples and '
        'model replies. Set to the empty string to not save at all',
    )
    parser.add_argument(
        '--save-format',
        type=str,
        default='conversations',
        choices=['conversations', 'parlai'],
        help='Format to save logs in. conversations is a jsonl format, parlai is a text format.',
    )
    parser.set_defaults(interactive_mode=True, task='interactive')
    LocalHumanAgent.add_cmdline_args(parser, partial_opt=None)
    WorldLogger.add_cmdline_args(parser, partial_opt=None)
    return parser


def interactive(opt):

    if isinstance(opt, ParlaiParser):
        logging.error('interactive should be passed opt not Parser')
        opt = opt.parse_args()

    # Create model and assign it to the specified task
    #print("@@@@@@@@@@@@@@@", opt, "D@@@@@@@@@@@@@@@")
    #print(type(opt))
    agent = create_agent(opt, requireModelExists=True)
    agent.opt.log()
    human_agent = LocalHumanAgent(opt)
    # set up world logger
    world_logger = WorldLogger(opt) if opt.get('outfile') else None
    world = create_task(opt, [human_agent, agent])

    # Show some example dialogs:
    while not world.epoch_done():
        world.parley(f_socket)
        if world.epoch_done() or world.get_total_parleys() <= 0:
            # chat was reset with [DONE], [EXIT] or EOF
            if world_logger is not None:
                world_logger.reset()
            continue

        if world_logger is not None:
            world_logger.log(world)
        if opt.get('display_examples'):
            print("---")
            print(world.display())

    if world_logger is not None:
        # dump world acts to file
        world_logger.write(opt['outfile'], world, file_format=opt['save_format'])


@register_script('interactive', aliases=['i'])
class Interactive(ParlaiScript):
    @classmethod
    def setup_args(cls):
        return setup_args()

    def run(self):
        return interactive(self.opt)


def make_so():
    s_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    print("Model Socket Server bind")
    s_sock.bind((HOST, PORT))
    s_sock.listen()
    return s_sock


f_socket = make_so()
#interactive(opt)

if __name__ == '__main__':
    random.seed(42)
    Interactive.main()
