import * as React from 'react';

import { Config, Options } from '../ml/config';

interface OptionsProps {
    running: boolean;
    config: Config;
    options: Options;
    onStart: () => void;
    onStop: () => void;
    onHideOptionsComponent: () => void;
    onCopyState: () => void;
}

export class OptionsComponent extends React.Component {
    props: OptionsProps;

    handleStartModeChange(event) {
        this.props.options.startMode = event.target.value;
        this.forceUpdate();
    }

    handleFileNameChange(event) {
        this.props.options.fileName = event.target.value;
        this.forceUpdate();
    }

    handleInputValueChange(event) {
        this.props.options.inputValue = event.target.value;
        this.forceUpdate();
    }

    render() {
        return <div className="overlay" onClick={this.props.onHideOptionsComponent}>
            <div className="floating-container" onClick={event => event.stopPropagation()}>
                <button disabled={this.props.running} onClick={this.props.onStart}>START</button>
                <button disabled={!this.props.running} onClick={this.props.onStop}>STOP</button>
                <button onClick={this.props.onCopyState}>COPY STATE</button>
                <fieldset disabled={this.props.running}>
                    Networks #: <input defaultValue={String(this.props.config.networksNumber)} onKeyUp={event => this.props.config.networksNumber = Number((event.target as HTMLInputElement).value)} />
                    Culling %: <input defaultValue={String(this.props.config.cullingPercent)} onKeyUp={event => this.props.config.cullingPercent = Number((event.target as HTMLInputElement).value)} />
                    Fitness threshold: <input defaultValue={String(this.props.config.fitnessThreshold)} onKeyUp={event => this.props.config.fitnessThreshold = Number((event.target as HTMLInputElement).value)} />
                    Weight mut: <input defaultValue={String(this.props.config.weightMutation)} onKeyUp={event => this.props.config.weightMutation = Number((event.target as HTMLInputElement).value)} />
                    Synapse mut: <input defaultValue={String(this.props.config.synapseMutation)} onKeyUp={event => this.props.config.synapseMutation = Number((event.target as HTMLInputElement).value)} />
                    Neuron mut: <input defaultValue={String(this.props.config.neuronMutation)} onKeyUp={event => this.props.config.neuronMutation = Number((event.target as HTMLInputElement).value)} />
                    C1: <input defaultValue={String(this.props.config.c1)} onKeyUp={event => this.props.config.c1 = Number((event.target as HTMLInputElement).value)} />
                    C2: <input defaultValue={String(this.props.config.c2)} onKeyUp={event => this.props.config.c2 = Number((event.target as HTMLInputElement).value)} />
                    C3: <input defaultValue={String(this.props.config.c3)} onKeyUp={event => this.props.config.c3 = Number((event.target as HTMLInputElement).value)} />
                    Species threshold: <input defaultValue={String(this.props.config.sameSpeciesThreshold)} onKeyUp={event => this.props.config.sameSpeciesThreshold = Number((event.target as HTMLInputElement).value)} />
                </fieldset>
                <fieldset>
                    <div>START</div>
                    <div>
                        <label><input type="radio" name="startMode" value="fresh" checked={this.props.options.startMode === 'fresh'} onChange={event => this.handleStartModeChange(event)} />FRESH</label>
                    </div>
                    <div>
                        <label><input type="radio" name="startMode" value="file" checked={this.props.options.startMode === 'file'} onChange={event => this.handleStartModeChange(event)} />FROM FILE</label>
                    </div>
                    <div>
                        <label><input type="radio" name="startMode" value="input" checked={this.props.options.startMode === 'input'} onChange={event => this.handleStartModeChange(event)} />FROM INPUT</label>
                    </div>
                    <div>
                        File name: <input value={this.props.options.fileName} onChange={event => this.handleFileNameChange(event)} />
                    </div>
                    <div>
                        Initial state: <textarea value={this.props.options.inputValue} onChange={event => this.handleInputValueChange(event)} />
                    </div>
                </fieldset>
            </div>
        </div>
    }
}