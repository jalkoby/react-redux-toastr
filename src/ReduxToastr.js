import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import cn from 'classnames';
import ToastrBox from './ToastrBox';
import ToastrConfirm from './ToastrConfirm';
import * as actions from './actions';
import {EE} from './toastrEmitter';
import {updateConfig} from './utils';

export class ReduxToastr extends React.Component {
  static displayName = 'ReduxToastr';

  static propTypes = {
    toastr: PropTypes.object,
    options: PropTypes.object,
    position: PropTypes.string,
    newestOnTop: PropTypes.bool,
    timeOut: PropTypes.number,
    confirmOptions: PropTypes.object,
    progressBar: PropTypes.bool,
    transitionIn: PropTypes.string,
    transitionOut: PropTypes.string,
    preventDuplicates: PropTypes.bool
  };

  static defaultProps = {
    position: 'top-right',
    newestOnTop: true,
    timeOut: 5000,
    progressBar: false,
    transitionIn: 'bounceIn',
    transitionOut: 'bounceOut',
    preventDuplicates: false,
    confirmOptions: {
      okText: 'ok',
      cancelText: 'cancel'
    }
  };

  toastrFired = {};

  constructor(props) {
    super(props);
    updateConfig(props);
  }

  componentDidMount() {
    const {add, showConfirm, clean, removeByType} = this.props;
    EE.on('toastr/confirm', showConfirm);
    EE.on('add/toastr', add);
    EE.on('clean/toastr', clean);
    EE.on('removeByType/toastr', removeByType);
  }

  componentWillUnmount() {
    EE.removeListener('toastr/confirm');
    EE.removeListener('add/toastr');
    EE.removeListener('clean/toastr');
    EE.removeListener('removeByType/toastr');
    this.toastrFired = {};
  }

  _addToMemory(id) {
    this.toastrFired[id] = true;
  }

  _renderToastrForPosition(position) {
    const {toastrs} = this.props.toastr;

    if (toastrs) {
      return toastrs
        .filter(item => item.position === position)
        .map(item => {
          const mergedItem = {
            ...item,
            options: {
              progressBar: this.props.progressBar,
              transitionIn: this.props.transitionIn,
              transitionOut: this.props.transitionOut,
              ...item.options
            }
          };

          return (
            <span key={item.id}>
              <ToastrBox
                inMemory={this.toastrFired}
                addToMemory={() => this._addToMemory(item.id)}
                item={mergedItem}
                {...this.props}
              />
              {item.options && item.options.attention && <div className="toastr-attention" />}
            </span>
          );
        });
    }
  }

  _renderToastrs() {
    return (
      <span>
        <div className="top-left">
          {this._renderToastrForPosition('top-left')}
        </div>
        <div className="top-right">
          {this._renderToastrForPosition('top-right')}
        </div>
        <div className="top-center">
          {this._renderToastrForPosition('top-center')}
        </div>
        <div className="bottom-left">
          {this._renderToastrForPosition('bottom-left')}
        </div>
        <div className="bottom-right">
          {this._renderToastrForPosition('bottom-right')}
        </div>
        <div className="bottom-center">
          {this._renderToastrForPosition('bottom-center')}
        </div>
      </span>
    );
  }

  render() {
    const {className, toastr} = this.props;
    return (
      <span className={cn('redux-toastr', className)}>
        {toastr.confirm &&
          <ToastrConfirm
            confirm={toastr.confirm}
            {...this.props}
          />
        }
        {this._renderToastrs()}
      </span>
    );
  }
}

export default connect(
  state => ({
    toastr: state.toastr ? state.toastr : state.get('toastr')
  }),
  actions
)(ReduxToastr);
